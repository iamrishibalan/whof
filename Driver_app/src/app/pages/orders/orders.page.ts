
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  segId = 1;
  orders: any[] = [];
  oldOrders: any;
  dummy = Array(10);
  constructor(
    private router: Router,
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getOrders('', false);
    this.util.subscribeNewOrder().subscribe(() => {
      this.orders = [];
      this.oldOrders = [];
      this.getOrders('', false);
    });
  }

  ngOnInit() {

  }

  doRefresh(event) {
    this.getOrders(event, true);
  }

  onClick(val) {
    this.segId = val;
  }

  getOrders(event, haveRefresh) {
    this.orders = [];
    this.oldOrders = [];
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post('orders/getByDriverId', param).then((data) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status === 200 && data.data.length) {
        data.data.forEach(element => {
          element.orders = JSON.parse(element.orders);
          if (element.status === 'delivered' || element.status === 'cancelled' || element.status === 'rejected') {
            this.oldOrders.push(element);
          } else {
            this.orders.push(element);
          }
        });
        if (haveRefresh) {
          event.target.complete();
        }
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch((error) => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }
  goToOrderDetail(ids) {

    const navData: NavigationExtras = {
      queryParams: {
        id: ids
      }
    };

    this.router.navigate(['/order-detail'], navData);
  }
  getProfilePic(item) {
    return item && item.cover ? item.cover : 'assets/imgs/user.jpg';
  }
}
