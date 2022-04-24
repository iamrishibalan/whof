
import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.page.html',
  styleUrls: ['./coupons.page.scss'],
})
export class CouponsPage implements OnInit {
  list: any[] = [];
  restId: any;
  name: any;
  total: any;
  dummy = Array(10);
  storeid: any;
  constructor(
    public api: ApisService,
    private route: ActivatedRoute,
    public util: UtilService,
    private navCtrl: NavController
  ) {
    this.getOffers();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log(data);
      if (data && data.restId) {
        this.storeid = data.id;
        this.restId = data.restId;
        this.name = data.name;
        this.total = parseFloat(data.totalPrice);
        console.log(this.restId);
      } else {
        this.dummy = [];
      }
    });
  }
  getOffers() {
    this.api.get('offers').then(data => {
      this.dummy = [];
      console.log('list=====>', data);
      this.list = [];
      if (data && data.status === 200 && data.data.length) {
        const currnetDate = moment().format('YYYY-MM-DD');
        data.data.forEach(element => {
          console.log(moment(element.expire).isAfter(currnetDate));
          if (element && element.status === '1' && moment(element.expire).isAfter(currnetDate)) {
            console.log('yes=>', element);
            element.available = element.available.split(',');
            this.list.push(element);
          }
        });
        // this.list = data;
      }
    }).catch(error => {
      this.dummy = [];
      console.log(error);
    });
  }
  claim(item) {
    console.log(item);
    console.log(this.restId);
    if (item && item.available && item.available.length) {
      const data = item.available.includes(this.storeid);
      console.log(data);
      if (data) {
        if (this.total >= item.min) {
          console.log('ok');
          this.util.showToast(this.util.translate('Coupon Applied'), 'success', 'bottom');
          this.util.publishCoupon(item);
          this.navCtrl.back();
        } else {
          this.util.errorToast(this.util.translate('For claiming this coupon your order required minimum order  of ') + item.min);
        }
      } else {
        this.util.errorToast(this.util.translate('This coupon is not valid for ') + this.name);
      }
    } else {
      this.util.errorToast(this.util.translate('This coupon is not valid for ') + this.name);
    }
  }
  expire(date) {
    return moment(date).format('llll');
  }
}
