
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import * as  moment from 'moment';
import { environment } from 'src/environments/environment';
import { CartService } from 'src/app/services/cart.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage implements OnInit {
  havePayment: boolean;
  haveStripe: boolean;
  havePayPal: boolean;
  haveCOD: boolean;
  havePayTM: boolean;
  haveInstamojo: boolean;
  havepayStack: boolean;
  haveflutterwave: boolean;
  dates: any = 0;
  times: any = 0;
  instamojo = {
    key: '',
    token: '',
    code: ''
  };
  instaENV: any;
  paystack = {
    pk: '',
    sk: '',
    code: ''
  };
  flutterwave = {
    pk: '',
    code: ''
  };
  haveRazor: boolean;
  razorKey: any;

  storeFCM: any;
  constructor(
    private router: Router,
    public api: ApisService,
    public util: UtilService,
    private navCtrl: NavController,
    public cart: CartService,
    private iab: InAppBrowser,
    private route: ActivatedRoute,
  ) {
    console.log('cart', this.cart.cart);
    console.log('all data', this.cart);
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
    this.getPayments();

    this.route.queryParams.subscribe(data => {
      this.dates = data.date,
        this.times = data.time
    });
  }

  async ngOnInit() {

  }

  getPayments() {
    this.util.show();
    this.api.get('payments').then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status === 200 && data.data) {
        const info = data.data.filter(x => x.status === '1');
        console.log('total payments', info);
        if (info && info.length > 0) {
          console.log('---->>', info);
          this.havePayment = true;
          const stripe = info.filter(x => x.id === '1');
          this.haveStripe = stripe && stripe.length > 0 ? true : false;
          const cod = info.filter(x => x.id === '2');
          this.haveCOD = cod && cod.length > 0 ? true : false;
          const payPal = info.filter(x => x.id === '3');
          this.havePayPal = payPal && payPal.length > 0 ? true : false;
          const razor = info.filter(x => x.id === '4');
          this.haveRazor = razor && razor.length > 0 ? true : false;
          const paytm = info.filter(x => x.id === '5');
          this.havePayTM = paytm && paytm.length > 0 ? true : false;
          const insta = info.filter(x => x.id === '6');
          this.haveInstamojo = insta && insta.length > 0 ? true : false;
          const paystack = info.filter(x => x.id === '7');
          this.havepayStack = paystack && paystack.length > 0 ? true : false;
          const flutterwave = info.filter(x => x.id === '8');
          this.haveflutterwave = flutterwave && flutterwave.length > 0 ? true : false;
          if (this.haveStripe) {
            // this.util.stripe = stripe;
            if (stripe) {
              const creds = JSON.parse(stripe[0].creds);
              if (stripe[0].env === '1') {
                this.util.stripe = creds.live;
              } else {
                this.util.stripe = creds.test;
              }
              this.util.stripeCode = creds && creds.code ? creds.code : 'USD';
            }
            console.log('============>>', this.util.stripe);
          }
          if (this.haveInstamojo) {
            const datas = info.filter(x => x.id === '6');
            this.instaENV = datas[0].env;
            if (insta) {
              const instaPay = JSON.parse(datas[0].creds);
              this.instamojo = instaPay;
              console.log('instaMOJO', this.instamojo);
            }
          }
          if (this.haveRazor) {
            const razorPay = info.filter(x => x.id === '4');
            const env = razorPay[0].env;
            if (razorPay) {
              const keys = JSON.parse(razorPay[0].creds);
              console.log('evnof razor pay', env);
              this.razorKey = env === '0' ? keys.test : keys.live;
              console.log('----------', this.razorKey);
            }
          }
          if (this.havepayStack) {
            const keys = JSON.parse(paystack[0].creds);
            this.paystack = keys;
            console.log('paystack variables', this.paystack);
          }

          if (this.haveflutterwave) {
            const keys = JSON.parse(flutterwave[0].creds);
            this.flutterwave = keys;
            console.log('flutterwave config', this.flutterwave);
          }
        } else {
          this.havePayment = false;
          this.util.showToast(this.util.translate('No Payment Found'), 'danger', 'bottom');
        }
      } else {
        this.havePayment = false;
        this.util.showToast(this.util.translate('No Payment Found'), 'danger', 'bottom');
      }
    }, error => {
      console.log(error);
      this.util.hide();
      this.havePayment = false;
      this.util.showToast(this.util.translate('Something went wrong'), 'danger', 'bottom');
    });
  }

  openStripe() {
    this.router.navigate(['stripe-payments']);
  }

  async makeOrder(method, key) {

    const param = {
      address: JSON.stringify(this.cart.deliveryAddress),
      applied_coupon: this.cart.coupon && this.cart.coupon.discount ? 1 : 0,
      coupon_id: this.cart.coupon && this.cart.coupon.discount ? this.cart.coupon.id : 0,
      pay_method: method,
      did: '',
      delivery_charge: this.cart.deliveryPrice,
      discount: this.cart.discount,
      grand_total: this.cart.grandTotal,
      orders: JSON.stringify(this.cart.cart),
      paid: key,
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


  proceed() {
    // this.util.errorToast('ongoing');
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const param = {
      key: this.razorKey,
      amount: this.cart.grandTotal ? this.cart.grandTotal * 100 : 5,
      email: this.getEmail(),
      logo: this.api.mediaURL + this.util.logo
    };
    console.log('to url===>', this.api.JSON_to_URLEncoded(param));
    const url = this.api.baseUrl + 'razorpay?' + this.api.JSON_to_URLEncoded(param);
    const browser: any = this.iab.create(url, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success')) {
        console.log('close');
        browser.close();
        const urlItems = new URL(event.url);
        const orderId = urlItems.searchParams.get('id');
        this.makeOrder('razorpay', orderId);
      }
    });
  }

  paypalPayment() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const param = {
      uid: localStorage.getItem('uid'),
      itemName: 'S2ftech',
      grandTotal: this.cart.grandTotal,
      dateTime: moment().format('YYYY-MM-DD HH:mm'),
      logo: this.api.mediaURL + this.util.logo
    };
    console.log('to url===>', this.api.JSON_to_URLEncoded(param));
    const url = this.api.baseUrl + 'paypal/buyProduct?' + this.api.JSON_to_URLEncoded(param);
    const browser: any = this.iab.create(url, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success') || navUrl.includes('checkout/done')) {
        console.log('close');
        browser.close();
        this.makeOrder('paypal', 'fromApp');
      }
    });
  }

  flutterpay() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const param = {
      key: this.flutterwave.pk,
      amount: this.cart.grandTotal,
      email: this.getEmail(),
      phone: this.util.userInfo.mobile,
      name: this.getName(),
      code: this.flutterwave.code,
      logo: this.api.mediaURL + this.util.logo
    };
    console.log('to url===>', this.api.JSON_to_URLEncoded(param));
    const url = this.api.baseUrl + 'flutterwave?' + this.api.JSON_to_URLEncoded(param);
    const browser: any = this.iab.create(url, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success') || navUrl.includes('closed')) {
        console.log('close');
        browser.close();
        if (navUrl.includes('success')) {
          const urlItems = new URL(event.url);
          const orderId = urlItems.searchParams.get('transaction_id');
          this.makeOrder('flutterwave', orderId);
        }
      }
    });
  }

  paystackPay() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const paykey = '' + Math.floor((Math.random() * 1000000000) + 1);
    const param = {
      key: this.paystack.pk,
      email: this.util.userInfo.email,
      amount: parseInt(this.cart.grandTotal) * 100,
      firstname: this.util.userInfo.first_name,
      lastname: this.util.userInfo.last_name,
      ref: paykey
    };
    console.log('to url===>', this.api.JSON_to_URLEncoded(param));
    const url = this.api.baseUrl + 'paystack?' + this.api.JSON_to_URLEncoded(param);
    const browser: any = this.iab.create(url, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success') || navUrl.includes('close')) {
        console.log('close');
        browser.close();
        if (navUrl.includes('success')) {
          console.log('closed---->>>>>');
          this.makeOrder('paystack', paykey);
        } else {
          console.log('closed');
        }
      }
    });
  }

  paytm() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const orderId = this.util.makeid(20);
    const param = {
      ORDER_ID: orderId,
      CUST_ID: localStorage.getItem('uid'),
      INDUSTRY_TYPE_ID: 'Retail',
      CHANNEL_ID: 'WAP',
      TXN_AMOUNT: this.cart.grandTotal ? this.cart.grandTotal : 5
    };
    console.log('to url===>', this.api.JSON_to_URLEncoded(param));
    const url = this.api.baseUrl + 'paytm/pay?' + this.api.JSON_to_URLEncoded(param);
    const browser: any = this.iab.create(url, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success')) {
        console.log('close');
        browser.close();
        this.makeOrder('paytm', orderId);
      }
    });
  }

  getName() {
    return this.util.userInfo && this.util.userInfo.first_name ?
      this.util.userInfo.first_name + ' ' + this.util.userInfo.last_name : 'Groceryee';
  }

  getEmail() {
    return this.util.userInfo && this.util.userInfo.email ? this.util.userInfo.email : 'info@groceryee.com';
  }

  instaPay() {
    let url;
    if (this.instaENV === '0') {
      url = 'https://test.instamojo.com/api/1.1/payment-requests/';
    } else {
      url = 'https://www.instamojo.com/api/1.1/payment-requests/';
    }

    const param = {
      allow_repeated_payments: 'False',
      amount: this.cart.grandTotal,
      buyer_name: this.getName(),
      purpose: 'S2ftech',
      redirect_url: this.api.baseUrl + 'paypal/success',
      phone: this.util.userInfo && this.util.userInfo.mobile ? this.util.userInfo.mobile : '',
      send_email: 'True',
      webhook: this.api.baseUrl,
      send_sms: 'True',
      email: this.getEmail()
    };

    this.util.show();
    this.api.instaPay(url, param, this.instamojo.key, this.instamojo.token).then((data: any) => {
      console.log(data);
      this.util.hide();
      console.log(JSON.parse(data.data));
      const info = JSON.parse(data.data);
      console.log('data.status', data.status);
      if (data.status === 201 && info && info.success === true) {
        const options: InAppBrowserOptions = {
          location: 'no',
          clearcache: 'yes',
          zoom: 'yes',
          toolbar: 'yes',
          closebuttoncaption: 'close'
        };
        const browser: any = this.iab.create(info.payment_request.longurl, '_blank', options);
        browser.on('loadstop').subscribe(event => {
          const navUrl = event.url;
          console.log('navURL', navUrl);
          if (navUrl.includes('success')) {
            browser.close();
            const urlItems = new URL(event.url);
            console.log(urlItems);
            const orderId = urlItems.searchParams.get('payment_id');
            this.makeOrder('instamojo', orderId);
          }
        });
      } else {
        const error = JSON.parse(data.error);
        console.log('error message', error);
        if (error && error.message) {
          this.util.showToast(error.message, 'danger', 'bottom');
          return false;
        }
        this.util.showToast(this.util.translate('Something went wrong'), 'danger', 'bottom');
      }
    }, error => {
      console.log(error);
      this.util.hide();
      const message = JSON.parse(error.error);
      console.log('error message', message);
      if (message && message.message) {
        this.util.showToast(message.message, 'danger', 'bottom');
        return false;
      }
      this.util.showToast(this.util.translate('Something went wrong'), 'danger', 'bottom');
    }).catch(error => {
      console.log(error);
      this.util.hide();
      const message = JSON.parse(error.error);
      console.log('error message', message);
      if (message && message.message) {
        this.util.showToast(message.message, 'danger', 'bottom');
        return false;
      }
      this.util.showToast(this.util.translate('Something went wrong'), 'danger', 'bottom');
    });
  }

  async createOrder() {

    const param = {
      address: JSON.stringify(this.cart.deliveryAddress),
      applied_coupon: this.cart.coupon && this.cart.coupon.discount ? 1 : 0,
      coupon_id: this.cart.coupon && this.cart.coupon.discount ? this.cart.coupon.id : 0,
      pay_method: 'cod',
      did: '',
      delivery_charge: this.cart.deliveryPrice,
      discount: this.cart.discount,
      grand_total: this.cart.grandTotal,
      orders: JSON.stringify(this.cart.cart),
      paid: 'none',
      restId: this.cart.cartStoreInfo.uid,
      serviceTax: this.cart.orderTax,
      status: 'created',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      total: this.cart.totalPrice,
      uid: localStorage.getItem('uid'),
      notes: this.cart.orderNotes,
      Bookdate: this.dates,
      Booktime: this.times,
      Availability_time : '1'
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

  // backkkk1(){
  //   this.navCtrl.navigateRoot(['tabs/tab5/help']);
  // }
}
