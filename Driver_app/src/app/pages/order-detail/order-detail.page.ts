
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { ModalController, NavController } from '@ionic/angular';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { VerifyPage } from '../verify/verify.page';
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage implements OnInit {

  tabId;
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
  deliveryCharge: any;
  username: any;
  useremail: any;
  userphone: any;
  usercover: any;
  payment: any;
  myname: any;
  token: any;
  changeStatusOrder: any;
  loaded: boolean;
  orderNotes: any = '';
  userInfo: any;
  constructor(
    private route: ActivatedRoute,
    public api: ApiService,
    private router: Router,
    public util: UtilService,
    private navCtrl: NavController,
    private iab: InAppBrowser,
    private modalCtrl: ModalController) {
    this.loaded = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log(data);
      this.tabId = data.id;
      this.id = data.id;
      this.myname = this.util.userInfo && this.util.userInfo.first_name ?
        this.util.userInfo.first_name + ' ' + this.util.userInfo.last_name : '';
      console.log('my name', this.myname);
      this.getOrder();
    });
  }

  getOrder() {


    const param = {
      id: this.id
    };
    this.api.post('orders/getById', param).then((datas: any) => {
      console.log(datas);
      this.loaded = true;
      if (datas && datas.status === 200 && datas.data.length) {
        const data = datas.data[0];
        this.grandTotal = data.grand_total;
        this.orders = JSON.parse(data.orders);
        this.serviceTax = data.serviceTax;
        this.status = data.status;
        this.time = moment(data.time).format('llll');
        this.total = data.total;
        this.payment = data.pay_method;
        this.address = data.str_address;
        this.orderNotes = data.notes;
        if (data && data.address && data.address !== '') {
          const addr = JSON.parse(data.address);
          console.log(addr);
          this.deliveryAddress = addr.house + ' ' + addr.landmark + ' ' + addr.address + ' ' + addr.pincode;
        }
        this.deliveryCharge = data.delivery_charge;
        this.getUserInfo(data.uid);

        console.log('this', this.orders);
        this.restName = data.str_name;
      }
    }, error => {
      console.log('error in orders', error);
      this.loaded = true;
      this.util.errorToast('Something went wrong');
    }).catch(error => {
      console.log('error in order', error);
      this.loaded = true;
      this.util.errorToast('Something went wrong');
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
        this.userInfo = info;
        this.username = info.first_name + ' ' + info.last_name;
        this.useremail = info.email;
        this.userphone = info.mobile;
        this.usercover = info.cover;
        console.log('phone', this.userphone);
        this.token = info.fcm_token;
      }
    }, error => {
      console.log(error);
      this.util.errorToast('Something went wrong');
    }).catch((error) => {
      console.log(error);
      this.util.errorToast('Something went wrong');
    });
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: VerifyPage,
      componentProps: { code: this.userInfo.country_code, phone: this.userInfo.mobile }
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.role === 'ok') { // ok
        console.log('normal delivery');
        const value = 'delivered';
        const param = {
          id: this.id,
          status: value,
        };
        console.log('order param', param);
        this.util.show(this.util.translate('Please wait'));
        this.api.post('orders/editList', param).then((order) => {
          console.log(order);
          if (order && order.status === 200) {
            const driverParam = {
              id: localStorage.getItem('uid'),
              current: 'active'
            };
            console.log('driver param', driverParam);
            this.api.post('drivers/edit_profile', driverParam).then((driver) => {
              if (driver && driver.status === 200) {
                this.util.hide();
                const msg = this.util.translate('Your Order is ') + value + this.util.translate(' By ') + this.restName;
                this.api.sendNotification(msg, 'Order ' + value, this.token);
                Swal.fire({
                  title: this.util.translate('success'),
                  text: this.util.translate('Order status changed to ') + value,
                  icon: 'success',
                  timer: 2000,
                  backdrop: false,
                  background: 'white'
                });
                this.util.publishOrder();
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
            // edit_profile
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
      }
    });

    modal.present();
  }

  changeStatus(value) {
    console.log(value);
    if (value === 'ongoing') {
      console.log('ongoing....');
      const param = {
        id: this.id,
        status: value,
      };
      console.log('order param', param);
      this.util.show(this.util.translate('Please wait'));
      this.api.post('orders/editList', param).then((order) => {
        this.util.hide();
        if (order && order.status === 200) {
          const msg = this.util.translate('Your Order is ') + value + this.util.translate(' By ') + this.restName;
          this.api.sendNotification(msg, 'Order ' + value, this.token);
          Swal.fire({
            title: this.util.translate('success'),
            text: this.util.translate('Order status changed to ') + value,
            icon: 'success',
            timer: 2000,
            backdrop: false,
            background: 'white'
          });
          this.util.publishOrder();
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
    } else if (value === 'delivered' && this.util.delivery === '1') {
      console.log('delivery with =>');
      this.openModal();
    } else {
      const param = {
        id: this.id,
        status: value,
      };
      console.log('order param', param);
      this.util.show(this.util.translate('Please wait'));
      this.api.post('orders/editList', param).then((order) => {
        console.log(order);
        if (order && order.status === 200) {
          const driverParam = {
            id: localStorage.getItem('uid'),
            current: 'active'
          };
          console.log('driver param', driverParam);
          this.api.post('drivers/edit_profile', driverParam).then((driver) => {
            if (driver && driver.status === 200) {
              this.util.hide();
              const msg = this.util.translate('Your Order is ') + value + this.util.translate(' By ') + this.restName;
              this.api.sendNotification(msg, 'Order ' + value, this.token);
              Swal.fire({
                title: this.util.translate('success'),
                text: this.util.translate('Order status changed to ') + value,
                icon: 'success',
                timer: 2000,
                backdrop: false,
                background: 'white'
              });
              this.util.publishOrder();
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
          // edit_profile
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
    }
  }

  changeOrderStatus() {
    console.log('order status', this.changeStatusOrder);
    if (this.changeStatusOrder) {
      this.changeStatus(this.changeStatusOrder);
    }
  }

  goToTracker() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['/tracker'], navData);
  }
  call() {
    this.iab.create('tel:' + this.userphone, '_system')
  }
  mail() {
    this.iab.create('mailto:' + this.useremail, '_system')
  }

  back() {
    this.navCtrl.back();
  }

}
