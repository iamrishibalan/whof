import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { Platform, ModalController, NavController, AlertController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
import { orderBy, uniqBy } from 'lodash';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-saloon',
  templateUrl: './saloon.page.html',
  styleUrls: ['./saloon.page.scss'],
})
export class SaloonPage implements OnInit {
  plt;
  allRest: any[] = [];
  chips: any[] = [];
  showFilter: boolean;
  lat: any;
  lng: any;
  dummyRest: any[] = [];
  dummy = Array(5);
  haveLocation: boolean;
  profile: any;
  banners: any[] = [];
  dummyBanners = Array(2);
  closingtime: any;
  openingtime: any;
  slideOpts = {
    slidesPerView: 1.2,
    pagination: true
  };
  cityName: any;
  cityId: any;
  constructor(
    private platform: Platform,
    private router: Router,
    public api: ApisService,
    public util: UtilService,
    public modalController: ModalController,
    private chMod: ChangeDetectorRef,
    private iab: InAppBrowser,
  ) {
    this.chips = [
      this.util.translate('Ratting 4.0+'),
      // this.util.translate('Fastest Delivery'),
      this.util.translate('Cost'),
      this.util.translate('A-Z'),
      this.util.translate('Z-A'),
    ];
    this.haveLocation = false;
    if (this.platform.is('ios')) {
      this.plt = 'ios';
    } else {
      this.plt = 'android';
    }
    this.util.subscribeLocation().subscribe(data => {
      console.log('changedd----->>>');
      this.dummyRest = [];
      this.allRest = [];
      this.banners = [];
      this.dummyBanners = Array(2);
      this.dummy = Array(5);
      this.getRestaurants();
    });
    this.getRestaurants();
  }
  getRestaurants() {
    const param = {
      lat: localStorage.getItem('lat'),
      lng: localStorage.getItem('lng'),
      distance: 10,
      type: 1
    };

    this.api.post('stores/nearMe', param).then((data: any) => {
      this.dummyBanners = [];
      this.dummy = [];
      console.log(data);
      if (data && data.status === 200 && data.data.length > 0) {
        this.allRest = [];
        this.dummyRest = [];
        data.data = data.data.filter(x => x.status === '1');
        data.data = data.data.filter(x => x.dish === '5000');
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
          let datass1 = this.allRest[0].close_time
          let datass2 = this.allRest[0].open_time

          this.closingtime = new Date('1970-01-01T' + datass1 + 'Z')
            .toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: true, hour: 'numeric', minute: 'numeric' });
          this.openingtime = new Date('1970-01-01T' + datass2 + 'Z')
            .toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: true, hour: 'numeric', minute: 'numeric' });
        });
        const info = [...new Set(this.allRest.map(item => item.id))];
        console.log(info);
        this.getBanners(info);
        console.log(this.allRest);
        this.chMod.detectChanges();
      } else {
        this.allRest = [];
        this.dummy = [];
      }
    }, error => {
      console.log(error);
      this.dummyRest = [];
      this.dummyBanners = [];
    }).catch(error => {
      console.log(error);
      this.dummyRest = [];
      this.dummyBanners = [];
    });
  }
  getBanners(ids) {
    console.log(ids);
    this.api.get('banners').then((data: any) => {
      console.log('banners-->>', data);
      this.dummyBanners = [];
      this.banners = [];
      if (data && data.status === 200 && data.data && data.data.length) {
        this.dummyBanners = [];
        this.banners = [];
        data.data.forEach(element => {
          console.log(element);
          console.log(element.type === '0' && ids.includes(element.value));
          if (element.type === '0' && ids.includes(element.value)) {
            this.banners.push(element);
          } else if (element.type === '1') {
            this.banners.push(element);
          }
        });
      }
    }).catch((error: any) => {
      console.log('error=>', error);
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
  addFilter(index) {
    console.log(index);
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
  ngOnInit() {
    console.log('init');
  }
  openMenu(item) {
    console.log(item);
    if (item.isOpen === false || item.isClosed === '0') {
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        id: item.uid
      }
    };
    this.router.navigate(['saloon-category'], navData);
  }
  onSearchChange(event) {
    console.log(event.detail.value);
    if (event.detail.value && event.detail.value !== '') {
      this.allRest = this.dummyRest.filter((ele: any) => {
        return ele.name.toLowerCase().includes(event.detail.value.toLowerCase());
      });
    } else {
      this.allRest = this.dummyRest;
    }
  }
  chipChange(item) {
    this.allRest = this.dummyRest;
    console.log(item);
    if (item === 'Fastest Delivery') {
      this.allRest.sort((a, b) => {
        a = new Date(a.time);
        b = new Date(b.time);
        return a > b ? -1 : a < b ? 1 : 0;
      });
    }

    if (item === 'Ratting 4.0+') {
      this.allRest = [];

      this.dummyRest.forEach(ele => {
        if (ele.ratting >= 4) {
          this.allRest.push(ele);
        }
      });
    }

    if (item === 'Cost') {
      this.allRest.sort((a, b) => {
        a = a.time;
        b = b.time;
        return a > b ? -1 : a < b ? 1 : 0;
      });
    }

  }
  changeLocation() {
    this.router.navigate(['pick-location']);
  }
  // go(){
  //   this.router.navigate(['saloon-category']);
  // }

}
