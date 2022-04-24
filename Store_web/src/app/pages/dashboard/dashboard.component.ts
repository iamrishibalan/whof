
import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { NavigationExtras, Router } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastyService, ToastData, ToastOptions } from 'ng2-toasty';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('content', { static: false }) content: any;
  dummy = Array(5);
  page: number = 1;

  orders: any[] = [];
  dummOrders: any[] = [];
  stores: any[] = [];
  users: any[] = [];

  newOrders: any[] = [];
  onGoingOrders: any[] = [];
  oldOrders: any[] = [];

  allOrders: any[] = [];
  orderStatus: any[] = [];
  orderDetail: any[] = [];
  statusText: any = '';
  id: any;
  userInfo: any;
  userLat: any;
  userLng: any;
  driverId: any;
  assignee: any[] = [];
  assigneeDriver: any = [];
  address: any;
  drivers: any[] = [];
  dummyDrivers: any[] = [];
  selectedDriver: any = '';

  current: any = 'all';
  token: any;
  constructor(
    public api: ApisService,
    private router: Router,
    private modalService: NgbModal,
    public util: UtilService,
    private spinner: NgxSpinnerService,
    private toastyService: ToastyService,
  ) {
    this.getData();
    console.log(this.util.storeInfo);
    const uid = localStorage.getItem('uid');
    if (uid && uid !== null && uid !== 'null') {
      const param = {
        id: uid
      };
      this.api.post('stores/getByUid', param).then((data: any) => {
        console.log('*******************', data);
        if (data && data.status === 200 && data.data && data.data.length) {
          this.util.storeInfo = data.data[0];
          this.statusText = ' by ' + this.util.storeInfo.name;
        } else {
          localStorage.clear();
          this.router.navigate(['login']);
        }
      }, error => {
        console.log(error);
      });
    }
  }

  getData() {

    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post('orders/getByStore', param).then((data) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status === 200 && data.data) {
        this.newOrders = [];
        this.onGoingOrders = [];
        this.oldOrders = [];
        data.data.forEach(element => {
          element.order = JSON.parse(element.orders);
          element.time = moment(element.time).format('llll');
          console.log(element.status);
          if (element.status === 'created') {
            this.newOrders.push(element);
          } else if (element.status === 'accepted' || element.status === 'ongoing') {
            this.onGoingOrders.push(element);
          } else if (element.status === 'delivered' || element.status === 'cancel' || element.status === 'rejected') {
            this.oldOrders.push(element);
          }
        });
        this.orders = data.data;
        this.dummOrders = data.data;

      }
    }).catch((error) => {
      console.log(error);
      this.dummy = [];
      this.error(this.util.translate('Something went wrong'));
    });
  }

  ngOnInit(): void {
  }

  getCurrency() {
    // return this.api.getCurrencySymbol();
  }

  getClass(item) {
    if (item === 'created' || item === 'accepted' || item === 'picked') {
      return 'btn btn-primary btn-round';
    } else if (item === 'delivered') {
      return 'btn btn-success btn-round';
    } else if (item === 'rejected' || item === 'cancel') {
      return 'btn btn-danger btn-round';
    }
    return 'btn btn-warning btn-round';
  }

  getDates(date) {
    return moment(date).format('llll');
  }

  openOrder(item) {
    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        id: item.orderId
      }
    };
    this.router.navigate(['manage-orders'], navData);
  }

  openIt(item) {
    this.router.navigate([item]);
  }

  async open(status) {
    console.log(status);
    try {
      this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log(reason);
      });
    } catch (error) {
      console.log(error);
    }
  }

  close() {
    console.log('dismiss');
    const drivers = this.dummyDrivers.filter(x => x.id === this.selectedDriver);
    console.log(drivers);
    this.modalService.dismissAll();
    if (drivers && drivers.length > 0) {
      console.log('all ok');
      const param = {
        id: this.id,
        status: 'accepted',
        did: drivers[0].id
      };
      console.log('order param', param);
      this.spinner.show();
      this.api.post('orders/editList', param).then((order) => {
        console.log(order);
        if (order && order.status === 200) {
          const driverParam = {
            id: drivers[0].id,
            current: 'busy'
          };
          console.log('driver param', driverParam);
          this.api.post('drivers/edit_profile', driverParam).then((driver) => {
            if (driver && driver.status === 200) {
              this.spinner.hide();
              this.api.sendNotification(this.util.translate('New Order Received '),
                this.util.translate('New Order'), drivers[0].fcm_token);
              const msg = this.util.translate('Your Order is ') + this.util.translate('accepted') + this.util.translate(' By ') + this.util.storeInfo.name;
              this.api.sendNotification(msg, 'Order ' + 'accepted', this.token);
              Swal.fire({
                title: this.util.translate('success'),
                text: this.util.translate('Order status changed to ') + this.util.translate('accepted'),
                icon: 'success',
                timer: 2000,
                backdrop: false,
                background: 'white'
              });
              this.getData();
            } else {
              this.spinner.hide();
              this.error(this.util.translate('Something went wrong'));

            }
          }, error => {
            console.log(error);
            this.spinner.hide();
            this.error(this.util.translate('Something went wrong'));
          }).catch(error => {
            console.log(error);
            this.spinner.hide();
            this.error(this.util.translate('Something went wrong'));
          });
          // edit_profile
        } else {
          this.spinner.hide();
          this.error(this.util.translate('Something went wrong'));

        }
      }, error => {
        console.log(error);
        this.spinner.hide();
        this.error(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.spinner.hide();
        this.error(this.util.translate('Something went wrong'));
      });
    }
  }

  getDrivers() {
    if (this.util.storeInfo && this.util.storeInfo.cid) {
      const param = {
        id: this.util.storeInfo.cid
      };
      this.spinner.show();
      this.dummyDrivers = [];
      this.api.post('drivers/geyByCity', param).then((data: any) => {
        console.log('driver data--------------->>', data);
        this.spinner.hide();
        if (data && data.status === 200 && data.data.length) {
          const info = data.data.filter(x => x.status === '1');
          info.forEach(async (element) => {
            const distance = await this.distanceInKmBetweenEarthCoordinates(
              this.userLat,
              this.userLng,
              parseFloat(element.lat),
              parseFloat(element.lng));

            console.log('distance---------->>', distance);
            if (distance < 50 && element.current === 'active' && element.status === '1') {
              this.dummyDrivers.push(element);
            }
            // this.dummyDrivers.push(element); // fetch all
            console.log('dummtasedr', this.dummyDrivers);
          });
        }
      }, error => {
        console.log(error);
        this.spinner.hide();
        this.error(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.spinner.hide();
        this.error(this.util.translate('Something went wrong'));
      });
    }
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

  changeStatus(value, item) {
    console.log(value, item);
    if (value === 'created') {
      return false;
    }
    const add = JSON.parse(item.address);
    console.log('0<', add);
    this.userLat = parseFloat(add.lat);
    this.userLng = parseFloat(add.lng);
    this.id = item.orderId;
    this.token = item.user_fcm_token;
    if (value === 'accepted') {
      console.log('accpeted');
      this.getDrivers();
      this.presentModal();
    } else if (value === 'ongoing') {
      const param = {
        id: this.id,
        status: value,
      };
      console.log('order param', param);
      this.spinner.show();
      this.api.post('orders/editList', param).then((order) => {
        this.spinner.hide();
        if (order && order.status === 200) {
          const msg = this.util.translate('Your Order is ') + value + this.util.translate(' By ') + this.util.storeInfo.name;
          this.api.sendNotification(msg, 'Order ' + value, this.token);
          Swal.fire({
            title: this.util.translate('success'),
            text: this.util.translate('Order status changed to ') + value,
            icon: 'success',
            timer: 2000,
            backdrop: false,
            background: 'white'
          });
          this.getData();
        } else {
          this.spinner.hide();
          this.error(this.util.translate('Something went wrong'));
        }
      }, error => {
        console.log(error);
        this.spinner.hide();
        this.error(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.spinner.hide();
        this.error(this.util.translate('Something went wrong'));
      });
    } else {
      this.driverId = item.did;

      console.log('Cancel,delivered');
      const param = {
        id: this.id,
        status: value,
        did: this.driverId
      };
      console.log('order param', param);
      this.spinner.show();
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
              this.spinner.hide();
              this.api.sendNotification(this.util.translate('Order statuts changed '),
                this.util.translate('Order statuts changed'), this.token);
              const msg = this.util.translate('Your Order is ') + value + this.util.translate(' By ') + this.util.storeInfo.name;
              this.api.sendNotification(msg, 'Order ' + value, this.token);
              Swal.fire({
                title: this.util.translate('success'),
                text: this.util.translate('Order status changed to ') + value,
                icon: 'success',
                timer: 2000,
                backdrop: false,
                background: 'white'
              });
              this.getData();
            } else {
              this.spinner.hide();
              this.error(this.util.translate('Something went wrong'));
            }
          }, error => {
            console.log(error);
            this.spinner.hide();
            this.error(this.util.translate('Something went wrong'));
          }).catch(error => {
            console.log(error);
            this.spinner.hide();
            this.error(this.util.translate('Something went wrong'));
          });
          // edit_profile
        } else {
          this.spinner.hide();
          this.error(this.util.translate('Something went wrong'));

        }
      }, error => {
        console.log(error);
        this.spinner.hide();
        this.error(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.spinner.hide();
        this.error(this.util.translate('Something went wrong'));
      });
    }
  }

  async presentModal() {
    console.log(status);
    try {
      this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log(reason);
      });
    } catch (error) {
      console.log(error);
    }

  }

  sendNotification(value) {
    if (this.userInfo && this.userInfo.fcm_token) {
      this.api.sendNotification2('Your order #' + this.id + ' ' + value, 'Order ' + value, this.userInfo.fcm_token)
        .subscribe((data: any) => {
          console.log('onesignal', data);
        }, error => {
          console.log('onesignal error', error);
        });
    }
  }

  updateDriver(uid, value) {
    const param = {
      id: uid,
      current: value
    };
    console.log('param', param);
    this.api.post('drivers/edit_profile', param).then((data: any) => {
      console.log(data);
    }, error => {
      console.log(error);
    });
  }


  updateStatus(value) {
    const newOrderNotes = {
      status: 1,
      value: 'Order ' + value + this.statusText,
      time: moment().format('lll'),
    };
    this.orderDetail.push(newOrderNotes);

    this.spinner.show();
    const param = {
      id: this.id,
      notes: JSON.stringify(this.orderDetail),
      status: JSON.stringify(this.orderStatus)
    };
    this.api.post('orders/editList', param).then((data: any) => {
      console.log('order', data);
      this.spinner.hide();
      if (data && data.status === 200) {
        this.getData();
        this.sendNotification(value);
      } else {
        this.error(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
    });
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
      onRemove: () => {
        console.log('Toast  has been removed!');
      }
    };
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
      onRemove: () => {
        console.log('Toast  has been removed!');
      }
    };
    this.toastyService.success(toastOptions);
  }

  search(str) {
    this.current = 'all';
    this.resetChanges();
    console.log('string', str);
    this.orders = this.filterItems(str);
  }

  protected resetChanges = () => {
    this.orders = this.dummOrders;
  }

  filterItems(searchTerm) {
    return this.orders.filter((item) => {
      return item.orderId.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  changeOrders() {
    console.log(this.current);
    console.log('newOrders', this.newOrders);
  }
}
