
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  haveItems: boolean = false;
  myOrders: any[] = [];
  dummy = Array(10);
  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router,
    private chMod: ChangeDetectorRef
  ) {
    this.getMyOrders('', false);
    this.util.subscribeNewOrder().subscribe((data) => {
      this.getMyOrders('', false);
    });
  }

  ngOnInit(): void {
  }

  doRefresh(event) {
    console.log(event);
    this.getMyOrders(event, true);
  }

  getMyOrders(event, haveRefresh) {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post('orders/getByUid', param).then((data: any) => {
      this.dummy = [];
      console.log(data);
      if (data && data.status === 200 && data.data.length) {
        this.haveItems = true;
        data.data.forEach(element => {
          element.orders = JSON.parse(element.orders);
        });
        this.myOrders = data.data;
      } else {
        this.haveItems = false;
      }
      this.chMod.detectChanges();
      if (haveRefresh) {
        event.target.complete();
      }

    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  getCart() {
    this.router.navigate(['/tabs']);
  }
  goToHistoryDetail(orderId) {
    const navData: NavigationExtras = {
      queryParams: {
        id: orderId
      }
    };
    this.router.navigate(['/order-details'], navData);
  }
  getDate(date) {
    return moment(date).format('llll');
  }

}
