
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
@Component({
  selector: 'app-rest-details',
  templateUrl: './rest-details.page.html',
  styleUrls: ['./rest-details.page.scss'],
})
export class RestDetailsPage implements OnInit {
  slideOpts = {
    slidesPerView: 2.3,
  };
  id: any;
  name: any;
  descritions: any;
  cover: any = '';
  address: any;
  ratting: any;
  time: any;
  totalRatting: any;
  dishPrice: any;
  cusine: any[] = [];
  foods: any[] = [];
  dummyFoods: any[] = [];
  categories: any[] = [];
  dummy = Array(50);
  veg: boolean = true;
  totalItem: any = 0;
  totalPrice: any = 0;
  deliveryAddress: any = '';
  images: any[] = [];
  isOpen: boolean = false;
  open: any;
  close: any;
  email: any;
  phone: any;
  constructor(
    private route: ActivatedRoute,
    public api: ApisService,
    public util: UtilService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log('data=>', data);
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.getVenueDetails();
      }
    });
  }

  getVenueDetails() {
    const body = {
      id: this.id
    };

    this.api.post('stores/getByUid', body).then((datas: any) => {
      console.log(datas);
      setTimeout(()=>{
        if (datas && datas.status === 200 && datas.data.length > 0) {
          const data = datas.data[0];
          if (data) {
            this.name = data.name;
            this.descritions = data.descriptions;
            this.cover = data.cover;
            this.address = data.address;
            this.ratting = data.rating ? data.rating : 0;
            this.totalRatting = data.total_rating ? data.total_rating : 0;
            this.dishPrice = data.dish;
            this.time = data.time;
            if (data.cusine && data.cusine !== '') {
              this.cusine = JSON.parse(data.cusine);
            } else {
              this.cusine = [];
            }
            this.images = JSON.parse(data.images);
            this.open = moment('10-10-2020 ' + data.open_time).format('LT');
            this.close = moment('10-10-2020 ' + data.close_time).format('LT');
            this.phone = data.mobile;
            const format = 'HH:mm:ss';
  
            const currentTime = moment().format(format);
            console.log(currentTime);
            const time = moment(currentTime, format);
            const beforeTime = moment(data.open_time, format);
            const afterTime = moment(data.close_time, format);
  
            if (time.isBetween(beforeTime, afterTime)) {
              console.log('is between');
              this.isOpen = true;
            } else {
              this.isOpen = false;
              console.log('is not between');
            }
          }
        }
      },1000)
     
    }, error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

}
