
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';
@Component({
  selector: 'app-flutterwavecallback',
  templateUrl: './flutterwavecallback.component.html',
  styleUrls: ['./flutterwavecallback.component.scss']
})
export class FlutterwavecallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    public api: ApiService,
    public util: UtilService,
    public cart: CartService,
    private router: Router
  ) {
    this.route.queryParams.subscribe((data) => {
      console.log(data);

      console.log('calculated', this.cart.grandTotal, this.cart.cart);
      if (data && data.status === 'successful' && this.cart.cart.length) {
        const couponadded = localStorage.getItem('selectedOffer');
        console.log('selected coupon', couponadded);
        if (couponadded && couponadded !== 'undefined' && couponadded !== undefined) {
          this.cart.coupon = JSON.parse(couponadded);
        }
        this.cart.calcuate();
        this.createOrder('flutterwave', data.transaction_id);
      } else {
        localStorage.removeItem('selectedOffer');
        localStorage.removeItem('order_notes');
        localStorage.removeItem('store_fcm');
        localStorage.removeItem('delivery_address');
        this.router.navigate(['']);
      }
    });
  }

  ngOnInit(): void {
  }

  async createOrder(method, key) {
    const param = {
      address: localStorage.getItem('delivery_address'),
      applied_coupon: this.cart.coupon && this.cart.coupon.discount ? 1 : 0,
      coupon_id: this.cart.coupon && this.cart.coupon.discount ? this.cart.coupon.id : 0,
      pay_method: method,
      did: '',
      delivery_charge: this.cart.deliveryPrice,
      discount: this.cart.discount && this.cart.discount != null ? this.cart.discount : 0,
      grand_total: this.cart.grandTotal,
      orders: JSON.stringify(this.cart.cart),
      paid: key,
      restId: this.cart.cart[0].restId,
      serviceTax: this.cart.orderTax,
      status: 'created',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      total: this.cart.totalPrice,
      uid: localStorage.getItem('uid'),
      notes: localStorage.getItem('order_notes')
    };

    console.log('param----->', param);

    this.util.start();
    this.api.post('orders/save', param).then((data: any) => {
      console.log(data);
      this.util.stop();
      this.api.sendNotification('You have received new order', 'New Order Received', localStorage.getItem('store_fcm'));
      this.util.publishNewOrder();
      this.cart.clearCart();
      localStorage.removeItem('order_notes');
      localStorage.removeItem('selectedOffer');
      localStorage.removeItem('store_fcm');
      localStorage.removeItem('delivery_address');
      this.util.suucessMessage(this.util.translate('Order created'));
      this.router.navigate(['orders']);
    }, error => {
      console.log(error);
      this.util.stop();
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });

  }
}
