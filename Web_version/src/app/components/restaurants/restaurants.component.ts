
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { orderBy, uniqBy } from 'lodash';
import { ModalDirective } from 'angular-bootstrap-md';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent implements OnInit {
  @ViewChild('topBanners', { read: ElementRef }) public topBanners: ElementRef<any>;
  @ViewChild('filterModal') public filterModal: ModalDirective;
  tabID = '';

  plt;
  allRest: any[] = [];
  chips: any[] = [];
  showFilter: boolean;
  lat: any;
  lng: any;
  dummyRest: any[] = [];
  dummy = Array(15);
  haveLocation: boolean;
  profile: any;
  banners: any[] = [];
  dummyBanners = Array(10);
  slideOpts = {
    slidesPerView: 1.2,
    pagination: true
  };
  cityName: any;
  cityId: any;
  activeFilter: any;
  searchKeyword: any = '';
  haveData: boolean;
  @HostListener('window:beforeunload')
  canDeactivate(): any {
    console.log('ok');
  };

  constructor(
    private router: Router,
    public api: ApiService,
    private chMod: ChangeDetectorRef,
    public util: UtilService) {
    this.haveData = true;
    this.util.subscribeNewAddress().subscribe(data => {
      this.haveData = true;
      console.log('new address ');
      this.getRestaurants();
    });
    this.getRestaurants();
    this.util.subscribeFitlerCode().subscribe(data => {
      this.addFilter(data);
    });
  }

  ngOnInit(): void {
    window.addEventListener('scroll', this.scroll, true); // third parameter
  }

  onIndexChange(event) {
    console.log(event);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
  }

  scroll = (event: any): void => {
    const amount = event.srcElement.scrollTop;
    if (amount >= 280) {
      this.util.publishHeader({ header: true, total: this.allRest.length, active: this.activeFilter });
      return;
    } else {
      this.util.publishHeader({ header: false, total: this.allRest.length, active: this.activeFilter });
      return;
    }
  };

  goToRestDetail(item) {
    this.util.publishHeader({ header: false, total: this.allRest.length, active: this.activeFilter });
    this.router.navigate(['order', item.uid, item.name.replace(/\s+/g, '-').toLowerCase()])
  }

  openOffers(item) {
    if (item.type === '0') {
      this.util.publishHeader({ header: false, total: this.allRest.length, active: this.activeFilter });
      this.router.navigate(['order', item.value, item.message.replace(/\s+/g, '-').toLowerCase()])
    } else {
      window.open(item.value, '_blank')
    }

  }

  changeMenu(val) {
    this.tabID = val;
  }

  getRestaurants() {
    const param = {
      lat: localStorage.getItem('lat'),
      lng: localStorage.getItem('lng'),
      distance: 10,
      type: 1
    };

    this.api.post('stores/nearMe', param).then((data: any) => {
      this.dummy = [];
      console.log(data);
      if (data && data.status === 200 && data.data.length > 0) {
        this.allRest = [];
        this.dummyRest = [];
        data.data = data.data.filter(x => x.status === '1');
        data.data.forEach(async (element) => {
          element.rating = parseFloat(element.rating);
          element.time = parseInt(element.time);
          element.dish = parseInt(element.dish);
          element['isOpen'] = this.isOpen(element.open_time, element.close_time);
          if (element.cusine && element.cusine !== '') {
            element.cusine = JSON.parse(element.cusine).join();
          }
          this.allRest.push(element);
          this.dummyRest.push(element);
        });
        const info = [...new Set(this.allRest.map(item => item.id))];
        console.log(info);
        this.getBanners(info);
        console.log(this.allRest);
        this.chMod.detectChanges();
      } else {
        this.allRest = [];
        this.dummy = [];
        this.dummyRest = [];
        this.dummyBanners = [];
        this.haveData = false;
      }
    }, error => {
      console.log(error);
      this.dummyRest = [];
      this.allRest = [];
      this.dummy = [];
      this.haveData = false;
      this.dummyBanners = [];
    }).catch(error => {
      console.log(error);
      this.haveData = false;
      this.allRest = [];
      this.dummy = [];
      this.dummyRest = [];
      this.dummyBanners = [];
    });
  }

  addFilter(index) {
    console.log(index);
    this.activeFilter = index;
    if (index === 0) {
      console.log('rating');
      this.allRest = orderBy(this.allRest, 'rating', 'desc');
    } else if (index === 1) {
      console.log('fast');
      this.allRest = orderBy(this.allRest, 'time', 'asc');
    } else if (index === 2) {
      console.log('cost');
      this.allRest = orderBy(this.allRest, 'dish', 'asc');
    } else if (index === 3) {
      console.log('A-Z');
      this.allRest = orderBy(this.allRest, 'name', 'asc');
    } else if (index === 4) {
      console.log('Z-A');
      this.allRest = orderBy(this.allRest, 'name', 'desc');
    }
  }



  getBanners(ids) {
    console.log(ids);
    this.api.get('banners').then((data: any) => {
      console.log('banners-->>', data);
      this.banners = [];
      if (data && data.status === 200 && data.data && data.data.length) {
        data.data.forEach(element => {
          if (element.type === '0' && ids.includes(element.value)) {
            this.banners.push(element);
          } else if (element.type === '1') {
            this.banners.push(element);
          }
        });
        this.chMod.detectChanges();
        this.dummyBanners = [];
      } else {
        this.dummyBanners = [];
        this.banners = [];
      }
    }).catch((error: any) => {
      console.log('error=>', error);
      this.dummyBanners = [];
      this.banners = [];
    });
  }

  isOpen(open, close) {
    const format = 'HH:mm:ss';
    const currentTime = moment().format(format);
    const time = moment(currentTime, format);
    const beforeTime = moment(open, format);
    const afterTime = moment(close, format);

    if (time.isBetween(beforeTime, afterTime)) {
      return true;
    }
    return false;
  }

  onSearchChange(event) {
    console.log(event);
    if (event !== '') {
      this.allRest = this.dummyRest.filter((ele: any) => {
        return ele.name.toLowerCase().includes(event.toLowerCase());
      });
    } else {
      this.allRest = this.dummyRest;
    }
  }

  scrollRight() {
    this.topBanners.nativeElement.scrollLeft += 450;
  }

  scrollLeft() {
    this.topBanners.nativeElement.scrollLeft -= 450;
  }

  getAddressName() {
    const location = localStorage.getItem('address');
    if (location && location != null && location !== 'null') {
      return location.length > 30 ? location.slice(0, 30) + '....' : location;;
    }
    localStorage.clear();
    return 'No address';
  }

  showAddressChangePopup() {
    this.util.publishAddressPopup();
  }
}
