
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { AlertController, NavController } from '@ionic/angular';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.page.html',
  styleUrls: ['./history-detail.page.scss'],
})
export class HistoryDetailPage implements OnInit {
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
  need:any;
  coupon: boolean = false;
  dicount: any;
  dname: any;
  loaded: boolean;
  restFCM: any;
  driverFCM: any;
  dId: any;
  driverName: any;
  driverMobile: any;
  driverCover: any;
  orderNotes: any = '';
  delivery_charge: any = 0;
  bkdate :any;
  bktime:any;
  constructor(
    private route: ActivatedRoute,
    public api: ApisService,
    private router: Router,
    public util: UtilService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private iab: InAppBrowser
  ) {
    this.loaded = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log('data=>', data);
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.getOrder();
      }
    });
  }

  getOrder() {
    const param = {
      id: this.id
    };
    this.api.post('orders/getById', param).then((datas: any) => {
      this.loaded = true;
      console.log(datas);
      if (datas && datas.status === 200 && datas.data.length) {
        const data = datas.data[0];
        let val = JSON.parse(data.orders);
        this.need = val;
        this.util.orderDetails = data;
        this.grandTotal = data.grand_total;
        this.serviceTax = data.serviceTax;
        this.orders = JSON.parse(data.orders);
        this.status = data.status;
        this.time = moment(data.time).format('llll');
        this.total = data.total;
        this.paid = data.pay_method;
        this.delivery_charge = data.delivery_charge;
        this.address = data.str_address;
        this.bkdate = data.bdate;
        this.bktime = data.btime;
        this.restName = data.str_name;
        if (data && data.did && data.did !== '0') {
          this.dId = data.did;
          this.getDriverInfo();
        }
        this.coupon = data.applied_coupon === '1' ? true : false;
        this.dicount = data.discount;
        this.restPhone = data.str_mobile;
        this.restFCM = data.str_fcm_token;
        if (data && data.address) {
          const add = JSON.parse(data.address);
          this.deliveryAddress = add.house + ' ' + add.landmark + ' ' + add.address + add.pincode;
        }
        this.orderNotes = data.notes;
      } else {
        this.util.back();
      }
    }, error => {
      console.log('error in orders', error);
      this.loaded = true;
      // this.util.errorToast('Something went wrong');
    }).catch(error => {
      console.log('error in order', error);
      this.loaded = true;
      // this.util.errorToast('Something went wrong');
    });

  }

  async presentAlertConfirm() {
    debugger
    const alert = await this.alertController.create({
      header: 'How was your experience?',
      message: 'Rate ' + this.restName ,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Okay');
            this.router.navigate(['rate']);
          }
        }
      ]
    });

    await alert.present();
  }
  trackMyOrder() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['/tracker'], navData);
    //
  }
  call() {
    if (this.restPhone) {
      this.iab.create('tel:' + this.restPhone, '_system');
    }
  }

  getDriverInfo() {
    const param = {
      id: this.dId
    };
    this.api.post('drivers/getById', param).then((data: any) => {
      console.log('driver info--->>', data);
      if (data && data.status === 200 && data.data.length) {
        const info = data.data[0];
        this.util.orderDetails['driverInfo'] = info;
        console.log('---->>>>>', info);
        this.driverName = info.first_name + ' ' + info.last_name;
        this.driverMobile = info.mobile;
        this.driverCover = info.cover;
        this.driverFCM = info.fcm_token;
      }
    }, error => {
      console.log(error);
      this.util.errorToast('Something went wrong');
    }).catch((error) => {
      console.log(error);
      this.util.errorToast('Something went wrong');
    });
  }

  driverCall() {
    if (this.driverMobile) {
      this.iab.create('tel:' + this.driverMobile, '_system');
    } else {
      this.util.errorToast(this.util.translate('Number not found'));
    }
  }

  chat() {
    const param: NavigationExtras = {
      queryParams: {
        id: 0,
        name: 'Support',
        uid: localStorage.getItem('uid')
      }
    };
    this.router.navigate(['inbox'], param);
  }

  changeStatus() {
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To Cancel this order'),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      backdrop: false,
      background: 'white'
    }).then((data) => {
      console.log(data);
      if (data && data.value) {
        console.log('Cancel,delivered');
        const value = 'cancel';
        const param = {
          id: this.id,
          status: value,
        };
        console.log('order param', param);
        this.util.show(this.util.translate('Please wait'));
        this.api.post('orders/editList', param).then((order) => {
          console.log(order);
          if (order && order.status === 200) {
            if (this.dId && this.dId !== '' && this.dId !== '0') {
              const driverParam = {
                id: this.dId,
                current: 'active'
              };
              console.log('driver param', driverParam);
              this.api.post('drivers/edit_profile', driverParam).then((driver) => {
                if (driver && driver.status === 200) {
                  this.util.hide();
                  this.api.sendNotification(this.util.translate('Order statuts changed '),
                    this.util.translate('Order statuts changed'), this.driverFCM);
                  Swal.fire({
                    title: this.util.translate('success'),
                    text: this.util.translate('Order status changed to ') + value,
                    icon: 'success',
                    timer: 2000,
                    backdrop: false,
                    background: 'white'
                  });
                  this.navCtrl.back();
                } else {
                  this.util.hide();
                  this.util.errorToast(this.util.translate('Something went wrong'));
                  this.navCtrl.back();
                }
              }, error => {
                console.log(error);
                this.util.hide();
                this.util.errorToast(this.util.translate('Something went wrong'));
              }).catch(error => {
                console.log(error);
                this.util.hide();
                this.util.errorToast(this.util.translate('Something went wrong'));
              });
            } else {
              this.util.hide();
              this.navCtrl.back();
            }
            // edit_profile
          } else {
            this.util.hide();
            this.util.errorToast(this.util.translate('Something went wrong'));
            this.navCtrl.back();
          }
          this.util.errorToast(this.util.translate('Your booking cancelled'));
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate('Something went wrong'));
        }).catch(error => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
      }
    });
  }
}
