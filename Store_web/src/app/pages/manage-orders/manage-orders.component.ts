
import { UtilService } from './../../services/util.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { ApisService } from 'src/app/services/apis.service';
@Component({
  selector: 'app-manage-orders',
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.scss']
})
export class ManageOrdersComponent implements OnInit {
  id: any;
  grandTotal: any;
  orders: any[] = [];
  serviceTax: any;
  status: any;
  time: any;
  total: any;
  uid: any;
  address: any;
  restName: any;
  deliveryAddress: any;
  paid: any;
  restPhone: any;
  coupon: boolean = false;
  dicount: any;
  dname: any;
  restCover: any;
  username: any;
  userpic: any;
  userAddress: any;
  refund: boolean;
  payKey: any;

  orderNotes: any = '';
  constructor(
    public api: ApisService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastyService: ToastyService,
    private navCtrl: Location,
    public util: UtilService
  ) {
    this.route.queryParams.subscribe(data => {
      console.log(data);
      if (data && data.id) {
        this.id = data.id;
        this.getOrder();
      }
    });
  }
  getOrder() {
    this.spinner.show();
    const param = {
      id: this.id
    }
    this.api.post('orders/getById', param).then((datas: any) => {
      this.spinner.hide();
      console.log(datas);
      if (datas && datas.status === 200 && datas.data.length) {
        const data = datas.data[0];
        this.grandTotal = data.grand_total;
        this.orders = JSON.parse(data.orders);
        this.serviceTax = data.serviceTax;
        this.status = data.status;
        this.time = data.time;
        this.orderNotes = data.notes;
        this.restCover = data.str_cover;
        this.total = data.total;
        this.address = data.str_address;
        this.restName = data.str_name;
        if (data && data.address && data.address !== '') {
          const addr = JSON.parse(data.address);
          console.log(addr);
          this.deliveryAddress = addr.house + ' ' + addr.landmark + ' ' + addr.address + ' ' + addr.pincode;
          this.userAddress = addr.house + ' ' + addr.landmark + ' ' + addr.address + ' ' + addr.pincode;
        }
        this.paid = data.pay_method;
        console.log('this', this.orders);
        this.coupon = data.applied_coupon === '0' ? false : true;
        this.dicount = data.discount;
        this.getUserInfo(data.uid);
      }
    }).catch(error => {
      this.spinner.hide();
      console.log(error);
    });
  }

  getUserInfo(uid) {
    const param = {
      id: uid
    };

    this.api.post('users/getById', param).then((data) => {
      console.log(data);
      if (data && data.status === 200 && data.data.length) {
        const info = data.data[0];
        console.log('userinfo=====>>>', info);
        this.username = info.first_name + ' ' + info.last_name;
        this.userpic = info.cover;
      }
    }, error => {
      console.log(error);
    }).catch((error) => {
      console.log(error);
    });
  }

  ngOnInit() {
  }
  getDate(date) {
    return moment(date).format('llll');
  }



  error(message) {
    const toastOptions: ToastOptions = {
      title: this.util.translate('Error'),
      msg: message,
      showClose: true,
      timeout: 2000,
      theme: 'default',
      onAdd: (toast: ToastData) => {
        console.log('Toast ' + toast.id + ' has been added!');
      },
      onRemove: function (toast: ToastData) {
        console.log('Toast ' + toast.id + ' has been removed!');
      }
    };
    // Add see all possible types in one shot
    this.toastyService.error(toastOptions);
  }
  success(message) {
    const toastOptions: ToastOptions = {
      title: this.util.translate('Success'),
      msg: message,
      showClose: true,
      timeout: 2000,
      theme: 'default',
      onAdd: (toast: ToastData) => {
        console.log('Toast ' + toast.id + ' has been added!');
      },
      onRemove: function (toast: ToastData) {
        console.log('Toast ' + toast.id + ' has been removed!');
      }
    };
    // Add see all possible types in one shot
    this.toastyService.success(toastOptions);
  }

}
