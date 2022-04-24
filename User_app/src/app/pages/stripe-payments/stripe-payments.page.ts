
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import swal from 'sweetalert2';
import { NavController } from '@ionic/angular';
import { CartService } from 'src/app/services/cart.service';
import * as moment from 'moment';
import { ApisService } from 'src/app/services/apis.service';
@Component({
  selector: 'app-stripe-payments',
  templateUrl: './stripe-payments.page.html',
  styleUrls: ['./stripe-payments.page.scss'],
})
export class StripePaymentsPage implements OnInit {


  cards: any[] = [];
  token: any;
  paykey: any;
  storeFCM: any;
  dummy: any[] = [];
  constructor(
    private router: Router,
    private api: ApisService,
    public util: UtilService,
    private navCtrl: NavController,
    public cart: CartService
  ) {

    const param = {
      id: this.cart.cartStoreInfo.uid
    };
    this.api.post('users/getById', param).then((data: any) => {
      console.log('*******************', data);
      if (data && data.status === 200 && data.data && data.data.length) {
        this.storeFCM = data.data[0].fcm_token;
      }
    }, error => {
      console.log(error);
    });
  }

  ngOnInit() {
  }

  getCards() {
    this.dummy = Array(10);
    console.log(this.util.userInfo.stripe_key);
    this.api.httpGet('https://api.stripe.com/v1/customers/' + this.util.userInfo.stripe_key +
      '/sources?object=card', this.util.stripe).subscribe((cards: any) => {
        console.log(cards);
        this.dummy = [];
        if (cards && cards.data) {
          this.cards = cards.data;
          this.token = this.cards[0].id;
        }
      }, (error) => {
        this.dummy = [];
        console.log(error);
        if (error && error.error && error.error.error && error.error.error.message) {
          this.util.showErrorAlert(error.error.error.message);
          return false;
        }
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
  }

  payment() {
    console.log('place order');

    swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('Orders once placed cannot be cancelled and are non-refundable'),
      icon: 'question',
      confirmButtonText: this.util.translate('Yes'),
      cancelButtonText: this.util.translate('cancel'),
      showCancelButton: true,
      backdrop: false,
      background: 'white'
    }).then((data) => {
      console.log(data);
      if (data && data.value) {
        console.log('go to procesed,,');
        const options = {
          amount: parseInt(this.cart.grandTotal) * 100,
          currency: this.util.stripeCode,
          customer: this.util.userInfo.stripe_key,
          card: this.token,
        };
        console.log('options', options);
        const url = 'https://api.stripe.com/v1/charges';
        this.util.show();
        this.api.externalPost(url, options, this.util.stripe).subscribe((data: any) => {
          console.log('------------------------->', data);
          this.paykey = data.id;
          this.util.hide();
          this.util.showToast(this.util.translate('Payment Success'), 'success', 'bottom');
          this.createOrder();
        }, (error) => {
          this.util.hide();
          console.log(error);
          this.util.hide();
          if (error && error.error && error.error.error && error.error.error.message) {
            this.util.showErrorAlert(error.error.error.message);
            return false;
          }
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
      }
    });
  }

  async createOrder() {
    const param = {
      address: JSON.stringify(this.cart.deliveryAddress),
      applied_coupon: this.cart.coupon && this.cart.coupon.discount ? 1 : 0,
      coupon_id: this.cart.coupon && this.cart.coupon.discount ? this.cart.coupon.id : 0,
      pay_method: 'stripe',
      did: '',
      delivery_charge: this.cart.deliveryPrice,
      discount: this.cart.discount,
      grand_total: this.cart.grandTotal,
      orders: JSON.stringify(this.cart.cart),
      paid: this.paykey,
      restId: this.cart.cartStoreInfo.uid,
      serviceTax: this.cart.orderTax,
      status: 'created',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      total: this.cart.totalPrice,
      uid: localStorage.getItem('uid'),
      notes: this.cart.orderNotes
    };

    console.log('param----->', param);

    this.util.show();
    this.api.post('orders/save', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.cart.orderNotes = '';
      this.api.sendNotification('You have received new order', 'New Order Received', this.storeFCM);
      this.util.publishNewOrder();
      this.cart.clearCart();
      this.navCtrl.navigateRoot(['/success']);
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.showToast(this.util.translate('Something went wrong'), 'danger', 'bottom');
    });
  }

  onAdd() {
    this.router.navigate(['add-card']);
  }

  back() {
    this.navCtrl.back();
  }

  changeMethod(id) {
    this.token = id;
  }

  ionViewWillEnter() {
    if (this.util.userInfo && this.util.userInfo.stripe_key) {
      this.getCards();
    }

  }
}
