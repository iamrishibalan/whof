
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController, ModalController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { SelectDriversPage } from '../select-drivers/select-drivers.page';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage implements OnInit {
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
  userName: any;
  userEmail: any;
  userPic: any;
  phone: any;
  token: any;
  did: any;
  deliveryAddress: any;
  changeStatusOrder: any;
  drivers: any[] = [];
  dummyDriver: any[] = [];
  userLat: any;
  userLng: any;
  paid: any;
  orderString: any[] = [];
  loaded: boolean;
  deliveryCharge: any;

  driverId: any;
  driverName: any;
  driverMobile: any;
  driverCover: any;
  driverFCM: any;
  SaloonBook: boolean;
  Foodorder: boolean;
  orderNotes: any = '';
  storeAddresss: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public api: ApisService,
    public util: UtilService,
    private navCtrl: NavController,
    private printer: Printer,
    private modalController: ModalController,
    private iab: InAppBrowser) {
    this.loaded = false;
    this.route.queryParams.subscribe(data => {
      console.log(data);
      this.id = data.id;
      console.log('assignments--<<', this.util.driver_assignments);
      console.log('thisidd', this.id);
      this.getOrder();
      this.getDrivers();
    });
  }

  ngOnInit() {
    let val = localStorage.getItem('type');
    if (val == 'store') {
      this.Foodorder = true;
      this.SaloonBook = false;
    }
    else if (val == 'saloon') {
      this.Foodorder = false;
      this.SaloonBook = true;
    }
    this.getOrder();
  }

  back() {
    this.util.publishNewAddress('hello');
    this.navCtrl.back();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SelectDriversPage,
      backdropDismiss: false,
      showBackdrop: true,
      componentProps: {
        item: this.dummyDriver
      }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.role === 'selected') {
        if (data.data && data.data.length) {
          // this.placeOrder();
          const param = {
            id: this.id,
            status: 'accepted',
            did: data.data[0].id
          };
          console.log('order param', param);
          this.util.show(this.util.translate('Please wait'));
          this.api.post('orders/editList', param).then((order) => {
            console.log(order);
            if (order && order.status === 200) {
              const driverParam = {
                id: data.data[0].id,
                current: 'busy'
              };
              console.log('driver param', driverParam);
              this.api.post('drivers/edit_profile', driverParam).then((driver) => {
                if (driver && driver.status === 200) {
                  this.util.hide();
                  this.api.sendNotification(this.util.translate('New Order Received '),
                    this.util.translate('New Order'), data.data[0].fcm_token);
                  console.log('data', data);
                  const msg = this.util.translate('Your Order is ') + 'accepted' + this.util.translate(' By ') + this.restName;
                  this.api.sendNotification(msg, 'Order ' + 'accepted', this.token);
                  Swal.fire({
                    title: this.util.translate('success'),
                    text: this.util.translate('Order status changed to ') + 'accepted',
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
    });
    await modal.present();
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    console.log(lat1, lon1, lat2, lon2);
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  getUserInfo(uid) {
    const param = {
      id: uid
    };

    setTimeout(() => {
      this.api.post('users/getById', param).then((data) => {
        console.log(data);
        if (data && data.status === 200 && data.data.length) {
          const info = data.data[0];
          console.log('userinfo=====>>>', info);
          this.userName = info.first_name + ' ' + info.last_name;
          this.phone = info.mobile;
          this.token = info.fcm_token;
          this.userEmail = info.email;
          this.userPic = info.cover;
          // this.userLat
        }
      }, error => {
        console.log(error);
        this.util.errorToast('Something went wrong');
      }).catch((error) => {
        console.log(error);
        this.util.errorToast('Something went wrong');
      });
    }, 500);
  }

  getDriverInfo() {
    const param = {
      id: this.driverId
    };
    this.api.post('drivers/getById', param).then((data: any) => {
      console.log('driver info--->>', data);
      if (data && data.status === 200 && data.data.length) {
        const info = data.data[0];
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

  getDrivers() {
    this.api.get('drivers').then((data) => {
      console.log('driver info*************', data);
      if (data && data.status === 200 && data.data.length) {
        const drivers = data.data.filter(x => x.current === 'active' && x.status === '1');
        console.log(drivers);
        drivers.forEach(async (element) => {
          const distance = await this.distanceInKmBetweenEarthCoordinates(
            this.userLat,
            this.userLng,
            parseFloat(element.lat),
            parseFloat(element.lng));
          console.log('distance', distance);
          if (distance < 50) {
            element['distance'] = distance.toFixed(2);
            this.drivers.push(element);
            this.dummyDriver.push(element);
          }
        });
      }
    }, error => {
      console.log(error);
      this.util.errorToast('Something went wrong');
    }).catch((error) => {
      console.log(error);
      this.util.errorToast('Something went wrong');
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
        this.paid = data.pay_method;
        this.orderNotes = data.notes;
        this.deliveryCharge = data.delivery_charge;
        this.storeAddresss = data.str_address;
        if (data && data.did !== '') {
          this.driverId = data.did;
          this.getDriverInfo();
        }
        this.getUserInfo(data.uid);
        if (data && data.address) {
          const add = JSON.parse(data.address);
          this.deliveryAddress = add.house + ' ' + add.landmark + ' ' + add.address + add.pincode;
          this.userLat = add.lat;
          this.userLng = add.lng;
        }


      
        this.restName = data.str_name;
        this.orders.forEach(element => {
          console.log('ele,me=====>', element);
          if (element && element.selectedItem && element.selectedItem.length > 0) {
            console.log('======>>');
            let items = '';
            element.selectedItem.forEach((subItems, j) => {
              const subDatas = [];
              items = '<div style="border-bottom:1px dashed lightgray"> <p style="font-weight:bold"> ' + element.name + ' X ' +
                element.selectedItem[j].total + '##ITEWS## </p></div>';
              subItems.item.forEach((addons, k) => {
                subDatas.push('<div style="display:flex;flex-direction:row;justify-content:space-between"> <p style="font-weight:bold;color:gray;margin:0px;"> -' +
                  addons.name + '</p> <p style="font-weight:bold;color:gray;margin:0px;">' + this.getCurrency() + ' ' + addons.value + '</p> </div> ');
              });
              const subOrders = subDatas.join('');
              const info = items.replace('##ITEWS##', subOrders);
              this.orderString.push(info);
            });
            console.log('news --->>', items);
          } else {
            const items = '<div style="border-bottom:1px dashed lightgray;display:flex;flex-direction:row;justify-content:space-between"> <p style="font-weight:bold"> ' +
              element.name + ' X ' +
              element.quantiy + ' </p> <p style="font-weight:bold">' + element.price + this.getCurrency() + '</p> </div>';
            this.orderString.push(items);
          }
        });
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

  goToTracker() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['/tracker'], navData);
  }

  getCurrency() {
    return this.util.currecny;
  }

  autoAssignment() {
    console.log('auto assignents', this.drivers);
    if (this.drivers && this.drivers.length) {
      const max = this.drivers.reduce((prev, current) => (prev.distance < current.distance) ? prev : current)
      console.log('max', max);
      if (max && max.id) {
        console.log('assigne to this driver', max.first_name);

        const param = {
          id: this.id,
          status: 'accepted',
          did: max.id
        };
        console.log('order param', param);
        this.util.show(this.util.translate('Please wait'));
        this.api.post('orders/editList', param).then((order) => {
          console.log(order);
          if (order && order.status === 200) {
            const driverParam = {
              id: max.id,
              current: 'busy'
            };
            console.log('driver param', driverParam);
            this.api.post('drivers/edit_profile', driverParam).then((driver) => {
              if (driver && driver.status === 200) {
                this.util.hide();
                this.api.sendNotification(this.util.translate('New Order Received '),
                  this.util.translate('New Order'), max.fcm_token);
                // console.log('data', data);
                const msg = this.util.translate('Your Order is ') + 'accepted' + this.util.translate(' By ') + this.restName;
                this.api.sendNotification(msg, 'Order ' + 'accepted', this.token);
                Swal.fire({
                  title: this.util.translate('success'),
                  text: this.util.translate('Order status changed to ') + 'accepted',
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

      } else {
        console.log('no driver found');
        this.util.errorToast('No Active Driver Found');
      }
    } else {
      console.log('no driver found');
      this.util.errorToast('No Active Driver Found');
    }
  }

  changeStatus(value) {
    console.log(value);
    if (value === 'accepted') {
      console.log('accepted', this.drivers);
      if (this.util.driver_assignments === '0') {
        this.presentModal();
      } else {
        this.autoAssignment();
      }
    } else if (value === 'ongoing') {
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
    } else {
      console.log('Cancel,delivered');
      const param = {
        id: this.id,
        status: value,
        did: this.driverId
      };
      console.log('order param', param);
      this.util.show(this.util.translate('Please wait'));
      this.api.post('orders/editList', param).then((order) => {
        console.log(order);
        if (order && order.status === 200) {
          const driverParam = {
            id: this.driverId,
            current: 'active'
          };
          console.log('driver param', driverParam);
          this.api.post('drivers/edit_profile', driverParam).then((driver) => {
            if (driver && driver.status === 200) {
              this.util.hide();
              this.api.sendNotification(this.util.translate('Order statuts changed '),
                this.util.translate('Order statuts changed'), this.driverFCM);
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
              // this.util.errorToast(this.util.translate('Something went wrong'));
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
  changeStatuss(value, data) {
    console.log(value);
    if (value === 'accepted') {
      const param = {
        id: this.id,
        status: 'accepted'
      };
      this.api.post('orders/editList', param).then((order) => {
        console.log(order);
      })
      this.navCtrl.navigateRoot(['tabs/tab1']);
    } else {
      console.log('Cancel,delivered');
      const param = {
        id: this.id,
        status: value,
        did: this.driverId
      };
      console.log('order param', param);
      this.util.show(this.util.translate('Please wait'));
      this.api.post('orders/editList', param).then((order) => {
        console.log(order);
        if (order && order.status === 200) {
          const driverParam = {
            id: this.driverId,
            current: 'active'
          };
          console.log('driver param', driverParam);
          this.api.post('drivers/edit_profile', driverParam).then((driver) => {
            if (driver && driver.status === 200) {
              this.util.hide();
              this.api.sendNotification(this.util.translate('Order statuts changed '),
                this.util.translate('Order statuts changed'), this.driverFCM);
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

  call() {
    if (this.phone) {
      this.iab.create('tel:' + this.phone, '_system');
    } else {
      this.util.errorToast(this.util.translate('Number not found'));
    }
  }

  driverCall() {
    if (this.driverMobile) {
      this.iab.create('tel:' + this.driverMobile, '_system');
    } else {
      this.util.errorToast(this.util.translate('Number not found'));
    }
  }

  email() {
    if (this.userEmail) {
      this.iab.create('mailto:' + this.userEmail, '_system');
    } else {
      this.util.errorToast(this.util.translate('Email not found'));
    }
  }

  printOrder() {
    const options: PrintOptions = {
      name: 'Foodie Order Summary',
      duplex: false,
    };
    const order = this.orderString.join('');
    const content = '<div style="padding: 20px;display: flex;flex-direction: column;"> <img src="assets/icon.png" style="text-align: center; height: 100px;width: 100px;" alt=""> <h2 style="text-align: center;">S2ftech Order Summary</h2> <p style="float: left;"><b>' + this.id + '</b></p> <p style="float: left;"><b>' + this.restName + '</b></p> <p style="float: left;"><b>' + this.userName + '</b></p> <p style="float: left;">' + this.time + ' </p> <p style="font-weight: bold;">' + this.util.translate('ITEMS') + '</p> ' + order + ' <p style="border-bottom: 1px solid black;"><span style="float: left;font-weight: bold;">' + this.util.translate('SubTotal') + '</span> <span style="float: right;font-weight: bold;">₹' + this.total + '</span> <p style="border-bottom: 1px solid black;"><span style="float: left;font-weight: bold;">' + this.util.translate('Delivery Charge') + '</span> <span style="float: right;font-weight: bold;">₹5</span> </p> <p style="border-bottom: 1px solid black;"><span style="float: left;font-weight: bold;">' + this.util.translate('Service Tax') + '</span> <span style="float: right;font-weight: bold;">₹' + this.serviceTax + '</span> </p> <p style="border-bottom: 1px solid black;"><span style="float: left;font-weight: bold;">' + this.util.translate('Total') + '</span> <span style="float: right;font-weight: bold;">₹' + this.grandTotal + '</span> </p> <h1 style="text-align: center;text-transform: uppercase;">' + this.paid + '</h1> </div>';
    this.printer.print(content, options).then((data) => {
      console.log(data);
    }).catch(error => {
      console.log(error);
    });
  }
}
