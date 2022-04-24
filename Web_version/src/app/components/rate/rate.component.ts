
import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalDirective } from 'angular-bootstrap-md';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
@Component({
  selector: 'app-rate',
  templateUrl: './rate.component.html',
  styleUrls: ['./rate.component.scss']
})
export class RateComponent implements OnInit {
  @ViewChild('productRating') public productRating: ModalDirective;
  @ViewChild('storeRating') public storeRating: ModalDirective;
  @ViewChild('driverRating') public driverRating: ModalDirective;

  products: any;

  product_id: any;
  product_name: any;
  product_rate: any = 2;
  product_comment: any = '';
  product_total: any;
  product_rating: any[] = [];
  product_way: any;

  store_id: any;
  store_name: any;
  store_rate: any = 2;
  store_comment: any = '';
  store_total: any;
  store_rating: any[] = [];
  store_way: any;

  driver_id: any;
  driver_name: any;
  driver_rate: any = 2;
  driver_comment: any = '';
  driver_total: any;
  driver_rating: any[] = [];
  driver_way: any;
  constructor(
    public api: ApiService,
    public util: UtilService,
    private navCtrl: Location,
    private router: Router,
  ) {
    console.log(this.util.orderDetails);
    if (this.util.orderDetails && this.util.orderDetails.orders) {
      this.products = JSON.parse(this.util.orderDetails.orders);
      console.log(this.products);
    } else {
      this.util.errorMessage(this.util.translate('Something went wrong'));
      this.navCtrl.back();
    }
  }

  ngOnInit(): void {
  }

  onRatingChange(event) {
    console.log(event);
  }



  rateStore() {
    this.store_id = this.util.orderDetails.restId;
    this.store_name = this.util.orderDetails.str_name;
    this.store_way = 'order'
    const param = {
      where: 'sid = ' + this.store_id
    };
    this.util.start();
    this.api.post('rating/getFromCount', param).then((data: any) => {
      this.util.stop();
      console.log('data', data);
      if (data && data.status === 200) {
        if (data && data.data && data.data.total) {
          this.store_total = data.data.total;
          if (data.data.rating) {
            const rats = data.data.rating;
            console.log(rats.split(','));
            this.store_rating = rats.split(',');
          } else {
            this.store_rating = [];
          }
        } else {
          this.store_total = 0;
          this.store_rating = [];
        }
      } else {
        this.store_total = 0;
        this.store_rating = [];
      }
      this.storeRating.show();
      console.log('total', this.store_total);
    }, error => {
      console.log(error);
      this.util.stop();
      this.store_total = 0;
      this.store_rating = [];
    });

  }

  ratDriver() {
    this.driver_id = this.util.orderDetails.driverInfo.id;
    this.driver_name = this.util.orderDetails.driverInfo.first_name + ' ' + this.util.orderDetails.driverInfo.last_name;
    this.driver_way = 'order';
    console.log('id', this.driver_id);
    console.log('name', this.driver_name);
    const param = {
      where: 'did = ' + this.driver_id
    };
    this.util.start();
    this.api.post('rating/getFromCount', param).then((data: any) => {
      this.util.stop();
      console.log('data', data);
      if (data && data.status === 200) {
        if (data && data.data && data.data.total) {
          this.driver_total = data.data.total;
          if (data.data.rating) {
            const rats = data.data.rating;
            console.log(rats.split(','));
            this.driver_rating = rats.split(',');
          } else {
            this.driver_rating = [];
          }
        } else {
          this.driver_total = 0;
          this.driver_rating = [];
        }
      } else {
        this.driver_total = 0;
        this.driver_rating = [];
      }
      this.driverRating.show();
      console.log('total', this.driver_total);
    }, error => {
      console.log(error);
      this.util.stop();
      this.driver_total = 0;
      this.driver_rating = [];
    });

  }

  async rateProduct(item) {

    // const param: NavigationExtras = {
    //   queryParams: {
    //     id: item.id,
    //     name: item.name
    //   }
    // };
    // this.router.navigate(['product-rating'], param);
    //
    console.log('content', item);
    this.product_id = item.id;
    this.product_name = item.name;
    this.product_way = 'order';
    console.log('id', this.product_id);
    console.log('name', this.product_name);
    const param = {
      where: 'pid = ' + this.product_id
    };
    this.util.start();
    this.api.post('rating/getFromCount', param).then((data: any) => {
      this.util.stop();
      console.log('data', data);
      if (data && data.status === 200) {
        if (data && data.data && data.data.total) {
          this.product_total = data.data.total;
          if (data.data.rating) {
            const rats = data.data.rating;
            console.log(rats.split(','));
            this.product_rating = rats.split(',');
          } else {
            this.product_rating = [];
          }
        } else {
          this.product_total = 0;
          this.product_rating = [];
        }
      } else {
        this.product_total = 0;
        this.product_rating = [];
      }
      console.log('total', this.product_total);
      this.productRating.show();
    }, error => {
      console.log(error);
      this.util.stop();
      this.product_total = 0;
      this.product_rating = [];
    });
  }


  addProductRating() {
    console.log('add product rating', typeof this.product_rate);
    this.product_rating.push(this.product_rate);
    let count = 0;
    const sum = this.product_rating.reduce((sum, item, index) => {
      item = parseFloat(item);
      console.log(sum, item, index);
      count += item;
      return sum + item * (index + 1);
    }, 0);
    console.log(sum / count);
    const storeRating = (sum / count).toFixed(2);
    console.log('rate', this.product_rate, this.product_comment);
    if (this.product_comment === '') {
      this.util.errorMessage(this.util.translate('Something went wrong'));
      return false;
    }
    const param = {
      uid: localStorage.getItem('uid'),
      pid: this.product_id,
      did: 0,
      sid: 0,
      rate: this.product_rate,
      msg: this.product_comment,
      way: this.product_way,
      status: 1,
      timestamp: moment().format('YYYY-MM-DD')
    };

    this.util.start();
    this.api.post('rating/save', param).then((data: any) => {
      console.log(data);
      this.util.stop();
      if (data && data.status === 200) {
        this.util.suucessMessage(this.util.translate('Rating added'));
        const storeParam = {
          id: this.product_id,
          rating: storeRating
        }
        this.api.post('products/editList', storeParam).then((stores: any) => {
          console.log('products edit done', stores);
        }, error => {
          console.log(error);
        });
        this.product_rate = 0;
        this.product_comment = '';
        this.productRating.hide();
      } else {
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }
    }, error => {
      this.util.stop();
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  addStoreRating() {
    this.store_rating.push(this.store_rate);
    let count = 0;
    const sum = this.store_rating.reduce((sum, item, index) => {
      item = parseFloat(item);
      console.log(sum, item, index);
      count += item;
      return sum + item * (index + 1);
    }, 0);
    console.log(sum / count);
    const storeRating = (sum / count).toFixed(2);
    console.log('rate', this.store_rate, this.store_comment);
    if (this.store_comment === '') {
      this.util.errorMessage(this.util.translate('Something went wrong'));
      return false;
    }
    const param = {
      uid: localStorage.getItem('uid'),
      pid: 0,
      did: 0,
      sid: this.store_id,
      rate: this.store_rate,
      msg: this.store_comment,
      way: this.store_way,
      status: 1,
      timestamp: moment().format('YYYY-MM-DD')
    };

    this.util.start();
    this.api.post('rating/save', param).then((data: any) => {
      console.log(data);
      this.util.stop();
      if (data && data.status === 200) {
        this.util.suucessMessage(this.util.translate('Rating added'));
        const storeParam = {
          uid: this.store_id,
          total_rating: this.store_total + 1,
          rating: storeRating
        }
        this.api.post('stores/editByUid', storeParam).then((stores: any) => {
          console.log('store edit done', stores);
          this.store_rate = 0;
          this.store_comment = '';
          this.storeRating.hide();
        }, error => {
          console.log(error);
        });
      } else {
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }
    }, error => {
      this.util.stop();
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }


  addDriverRating() {
    this.driver_rating.push(this.driver_rate);
    let count = 0;
    const sum = this.driver_rating.reduce((sum, item, index) => {
      item = parseFloat(item);
      console.log(sum, item, index);
      count += item;
      return sum + item * (index + 1);
    }, 0);
    console.log(sum / count);
    const storeRating = (sum / count).toFixed(2);
    console.log('rate', this.driver_rate, this.driver_comment);
    if (this.driver_comment === '') {
      this.util.errorMessage(this.util.translate('Something went wrong'));
      return false;
    }
    const param = {
      uid: localStorage.getItem('uid'),
      pid: 0,
      did: this.driver_id,
      sid: 0,
      rate: this.driver_rate,
      msg: this.driver_comment,
      way: this.driver_way,
      status: 1,
      timestamp: moment().format('YYYY-MM-DD')
    };

    this.util.start();
    this.api.post('rating/save', param).then((data: any) => {
      console.log(data);
      this.util.stop();
      if (data && data.status === 200) {
        this.util.suucessMessage(this.util.translate('Rating added'));
        this.driverRating.hide();
        this.driver_rate = 0;
        this.driver_comment = '';
      } else {
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }
    }, error => {
      this.util.stop();
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }
}
