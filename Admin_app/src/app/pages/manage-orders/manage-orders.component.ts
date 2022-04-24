
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
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
  constructor(
    public api: ApisService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastyService: ToastyService,
    private navCtrl: Location,
    public util: UtilService
  ) {
    this.api.auth();
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
        // if (data && data.dId && data.dId.fullname) {
        //   this.dname = data.dId.fullname;
        // }
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

  refundIt() {
    console.log('id', this.id, this.refund, this.payKey);
    Swal.fire({
      title: this.api.translate('Are you sure?'),
      text: this.api.translate('to reject and refund this order?'),
      backdrop: false,
      background: 'white',
      confirmButtonText: this.api.translate('Reject & Refund'),
      cancelButtonText: this.api.translate('Cancel'),
      showConfirmButton: true,
      showCancelButton: true,
      icon: 'question'
    }).then((data) => {
      console.log(data);
      if (data && data.value) {
        console.log('->delete');
        // this.spinner.show();
        // this.api.updateOrderStatus(this.id, 'rejected').then((data: any) => {
        //   const param = {
        //     charge: this.payKey,
        //   };
        //   this.api.httpPost('https://api.stripe.com/v1/refunds', param).subscribe((data) => {
        //     console.log(data);
        //     Swal.fire({
        //       title: this.api.translate('Success'),
        //       text: this.api.translate('Order refund successfully'),
        //       icon: 'success',
        //     });
        //     this.navCtrl.back();
        //   }, error => {
        //     console.log(error);
        //     this.spinner.hide();
        //     console.log();
        //     if (error && error.error && error.error.error && error.error.error.message) {
        //       this.error(error.error.error.message);
        //       return false;
        //     }
        //     this.error(this.api.translate('Something went wrong'));
        //   });
        // }).catch(error => {
        //   this.spinner.hide();
        //   console.log(error);
        //   this.error(this.api.translate('Something went wrong'));
        // });
      }

    });

  }

  error(message) {
    const toastOptions: ToastOptions = {
      title: this.api.translate('Error'),
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
      title: this.api.translate('Success'),
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

  reject() {
    Swal.fire({
      title: this.api.translate('Are you sure?'),
      text: this.api.translate('to reject this order?'),
      backdrop: false,
      background: 'white',
      confirmButtonText: this.api.translate('Reject'),
      cancelButtonText: this.api.translate('Cancel'),
      showConfirmButton: true,
      showCancelButton: true,
      icon: 'question'
    }).then((data) => {
      console.log(data);
      if (data && data.value) {
        console.log('->delete');
        // this.spinner.show();
        // this.api.updateOrderStatus(this.id, 'rejected').then((data: any) => {
        //   this.spinner.hide();
        //   Swal.fire({
        //     title: this.api.translate('Success'),
        //     text: this.api.translate('Order rejected successfully'),
        //     icon: 'success',
        //   });
        //   this.navCtrl.back();
        // }).catch(error => {
        //   this.spinner.hide();
        //   console.log(error);
        //   this.error(this.api.translate('Something went wrong'));
        // });
      }

    });
  }


}
