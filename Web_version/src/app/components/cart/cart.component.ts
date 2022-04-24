
import { Router } from '@angular/router';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { RazorPayService } from 'src/app/services/razorPay';
import Swal from 'sweetalert2';
import {
  IPayPalConfig,
  ICreateOrderRequest
} from 'ngx-paypal';
import { ModalDirective } from 'angular-bootstrap-md';
import * as  moment from 'moment';
import { Location } from '@angular/common';
declare var google;
declare let Razorpay: any;
declare let PaystackPop: any;
declare let FlutterwaveCheckout: any;
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  @ViewChild('paypal', { static: true }) paypalElement: ElementRef;
  @ViewChild('frame') public frame: ModalDirective;
  @ViewChild('addressFromMap') public addressFromMap: ModalDirective;
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  @ViewChild('changedPlace') public changedPlace: ModalDirective;
  @ViewChild('offersModal') public offersModal: ModalDirective;
  public payPalConfig?: IPayPalConfig;
  toggle: any = 'rd1';
  dummy: any[] = [];
  myaddress: any[] = [];
  cards: any[] = [];
  token: any;
  RAZORPAY_OPTIONS = {
    'key': '',
    'amount': 0,
    'name': this.util.app_name,
    'order_id': '',
    'description': this.util.app_name + ' Payment',
    'image': this.api.mediaURL + this.util.logo,
    'prefill': {
      'name': '',
      'email': '',
      'contact': '',
      'method': ''
    },
    'modal': {},
    'theme': {
      'color': '#45C261'
    }
  };
  payMethods: any;
  payId: any;

  addCard: boolean;

  cnumber: any = '';
  cname: any = '';
  cvc: any = '';
  date: any = '';
  email: any = '';

  lat: any;
  lng: any;
  address: any = '';
  house: any = '';
  landmark: any = '';
  title: any = 'home';
  pincode: any = '';
  map: any;
  marker: any;

  // autocomplete1: { 'query': string };
  query: any = '';
  autocompleteItems1: any = [];
  GoogleAutocomplete;
  geocoder: any;
  addressSelected: boolean;

  orderNotes: any = '';

  storeFCM: any;

  offers: any[] = [];

  editAddressMode: boolean;
  editClicked: boolean;
  addressId: any;
  constructor(
    private route: Router,
    public cart: CartService,
    public api: ApiService,
    private razorpayService: RazorPayService,
    public util: UtilService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private navCtrl: Location
  ) {
    this.editAddressMode = false;
    console.log('min cart value------->>>>>>>>', this.cart.minOrderPrice);
    if (this.cart.totalPrice < this.cart.minOrderPrice) {
      console.log('it; min order');
      let text;
      if (this.util.cside === 'left') {
        text = this.util.currecny + ' ' + this.cart.minOrderPrice;
      } else {
        text = this.cart.minOrderPrice + ' ' + this.util.currecny;
      }
      this.util.errorMessage(this.util.translate('Minimum order amount must be') + text + this.util.translate('or more'));
      this.router.navigate(['']);
    }
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
    this.query = '';
    this.autocompleteItems1 = [];
    this.addressSelected = false;
    this.getAddress();
    this.getPayments();
    this.getOffers();
    this.cart.calcuate();
    localStorage.removeItem('selectedOffer');
    console.log('cart info==>>', this.cart.cart);
    const param = {
      id: this.cart.cart[0].restId
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

  ngOnInit(): void {
  }

  loadMap(lat, lng) {
    const location = new google.maps.LatLng(lat, lng);
    const style = [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [
          { saturation: -100 }
        ]
      }
    ];

    const mapOptions = {
      zoom: 16,
      scaleControl: false,
      streetViewControl: false,
      zoomControl: false,
      overviewMapControl: false,
      center: location,
      mapTypeControl: false,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 's2ftech']
      }
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    const mapType = new google.maps.StyledMapType(style, { name: 'Grayscale' });
    this.map.mapTypes.set('s2ftech', mapType);
    this.map.setMapTypeId('s2ftech');
    this.cd.detectChanges();
    this.addMarker(location);
  }

  addMarker(location) {
    const dot = {
      url: 'assets/map-marker.png',
      scaledSize: new google.maps.Size(50, 50), // scaled size
    };
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: dot
    });
  }

  goTopayment() {
    this.route.navigate(['/payment']);
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: this.cart.paypalCode,
      clientId: this.cart.paypal,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: this.cart.paypalCode,
            value: this.cart.grandTotal,
            breakdown: {
              item_total: {
                currency_code: this.cart.paypalCode,
                value: this.cart.grandTotal
              }
            }
          },
        }]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then(details => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);

        });

      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        // this.showSuccess = true;
        this.payId = data.id;
        this.createOrder('paypal', this.payId);
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
        // this.showCancel = true;

      },
      onError: err => {
        console.log('OnError', err);
        // this.showError = true;
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
        // this.resetStatus();
      },
    };
  }

  getAddressFromMaps(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(lat, lng);
    geocoder.geocode({ 'location': location }, (results, status) => {
      console.log(results);
      console.log('status', status);
      if (results && results.length) {
        this.address = results[0].formatted_address;
        this.cd.detectChanges();
        this.loadMap(lat, lng);

      }
    });
  }

  changeAddress() {
    this.addressFromMap.hide();
    this.changedPlace.show();
  }

  addNewAddress() {
    ///
    // this.newAddress.show();
    this.editClicked = false;
    this.util.start();
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          console.log(position);
          this.util.stop();
          this.addressSelected = false;
          this.editAddressMode = false;
          this.addressFromMap.show();
          this.getAddressFromMaps(position.coords.latitude, position.coords.longitude);
        },
        error => {
          this.util.stop();
          switch (error.code) {
            case 1:
              console.log('Permission Denied');
              this.util.errorMessage(this.util.translate('Location Permission Denied'));
              break;
            case 2:
              console.log('Position Unavailable');
              this.util.errorMessage(this.util.translate('Position Unavailable'));
              break;
            case 3:
              console.log('Timeout');
              this.util.errorMessage(this.util.translate('Failed to fetch location'));
              break;
          }
        }
      );
    } else {
      this.util.stop();
    };
  }

  editAddress(item) {
    console.log('item...--->><', item);
    this.editClicked = true;
    this.loadMap(item.lat, item.lng);
    this.editAddressMode = true;
    this.address = item.address;
    this.house = item.house;
    this.landmark = item.landmark;
    this.pincode = item.pincode;
    this.title = item.title;
    this.addressId = item.id;
    this.addressFromMap.show();
    this.chooseFromMaps();
  }

  editMyAddress() {
    this.addressFromMap.hide();
    if (this.address === '' || this.landmark === '' || this.house === '' || !this.pincode || this.pincode === '') {
      this.util.errorMessage(this.util.translate('All Fields are required'));
      return false;
    }
    const geocoder = new google.maps.Geocoder;
    this.util.start();
    geocoder.geocode({ address: this.house + ' ' + this.landmark + ' ' + this.address + ' ' + this.pincode }, (results, status) => {
      console.log(results, status);
      if (status === 'OK' && results && results.length) {
        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();
        console.log('----->', this.lat, this.lng);
        const param = {
          id: this.addressId,
          uid: localStorage.getItem('uid'),
          address: this.address,
          lat: this.lat,
          lng: this.lng,
          title: this.title,
          house: this.house,
          landmark: this.landmark,
          pincode: this.pincode
        };

        this.api.post('address/editList', param).then((data: any) => {
          this.util.stop();
          this.cd.detectChanges();
          if (data && data.status === 200) {
            this.getAddress();
            const Toast = Swal.mixin({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              onOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });

            Toast.fire({
              icon: 'success',
              title: this.util.translate('Address updated')
            });
          } else {
            this.util.errorMessage(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.util.stop();
          this.util.errorMessage(this.util.translate('Something went wrong'));
        });
      } else {
        this.util.stop();
        this.util.errorMessage(this.util.translate('Something went wrong'));
        return false;
      }
    });
  }

  updateAddress() {
    console.log('update address');
    if (this.address === '' || this.landmark === '' || this.house === '' || !this.pincode || this.pincode === '') {
      this.util.errorMessage(this.util.translate('All Fields are required'));
      return false;
    }
    this.util.start();
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode({ address: this.house + ' ' + this.landmark + ' ' + this.address + ' ' + this.pincode }, (results, status) => {
      console.log(results, status);
      if (status === 'OK' && results && results.length) {
        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();
        console.log('----->', this.lat, this.lng);
        const param = {
          id: this.addressId,
          uid: localStorage.getItem('uid'),
          address: this.address,
          lat: this.lat,
          lng: this.lng,
          title: this.title,
          house: this.house,
          landmark: this.landmark,
          pincode: this.pincode
        };

        this.api.post('address/editList', param).then((data: any) => {
          this.util.stop();
          if (data && data.status === 200) {
            this.getAddress();
            this.addressFromMap.hide();
            this.util.suucessMessage(this.util.translate('Address updated'));
          } else {
            this.util.errorMessage(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.util.stop();
          this.util.errorMessage(this.util.translate('Something went wrong'));
        });
      } else {
        this.util.stop();
        this.util.errorMessage(this.util.translate('Something went wrong'));
        return false;
      }
    });
  }

  chooseFromMaps() {
    // console.log(this.mapElement);
    this.addressSelected = true;
    document.getElementById('map').style.height = '150px';
  }

  payMethod(method) {
    console.log(method);
    this.payMethods = method;
  }

  removeAddonCartQ(i, j) {
    console.log(this.cart.cart[i].selectedItem[j]);
    if (this.cart.cart[i].selectedItem[j].total !== 0) {
      this.cart.cart[i].selectedItem[j].total = this.cart.cart[i].selectedItem[j].total - 1;
      if (this.cart.cart[i].selectedItem[j].total === 0) {
        const newCart = [];
        this.cart.cart[i].selectedItem.forEach(element => {
          if (element.total > 0) {
            newCart.push(element);
          }
        });
        console.log('newCart', newCart);
        this.cart.cart[i].selectedItem = newCart;
        this.cart.cart[i].quantiy = newCart.length;
        if (this.cart.cart[i].quantiy === 0) {
          this.cart.removeItem(this.cart.cart[i].id);
        }
      }
    }
    if (this.cart.cart.length === 0) {
      this.navCtrl.back();
    }
    if (this.cart.totalPrice < this.cart.minOrderPrice) {
      let text;
      if (this.util.cside === 'left') {
        text = this.util.currecny + ' ' + this.cart.minOrderPrice;
      } else {
        text = this.cart.minOrderPrice + ' ' + this.util.currecny;
      }
      Swal.fire({
        title: this.util.translate('Error'),
        text: this.util.translate('Minimum order amount must be ') + text + this.util.translate(' or more'),
        icon: 'error',
        showConfirmButton: true,
        confirmButtonText: this.util.translate('OK'),
        backdrop: false,
        background: 'white'
      }).then(status => {
        if (status && status.value) {

        }
      });
      this.navCtrl.back();
    }
    this.cart.calcuate();
  }

  getAddress() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.dummy = Array(10);
    this.api.post('address/getByUid', param).then((data) => {
      console.log(data);
      this.dummy = [];
      this.cd.detectChanges();
      if (data && data.status === 200 && data.data.length > 0) {
        this.myaddress = data.data;
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

  getPayments() {
    this.api.get('payments').then((data: any) => {
      console.log(data);
      if (data && data.status === 200 && data.data) {
        const info = data.data.filter(x => x.status === '1');
        console.log('total payments', info);
        if (info && info.length > 0) {
          console.log('---->>', info);
          this.cart.havePayment = true;
          const stripe = info.filter(x => x.id === '1');
          const cod = info.filter(x => x.id === '2');
          const paypal = info.filter(x => x.id === '3');
          const razor = info.filter(x => x.id === '4');
          const paytm = info.filter(x => x.id === '5');
          const insta = info.filter(x => x.id === '6');
          const paystack = info.filter(x => x.id === '7');
          const flutterwave = info.filter(x => x.id === '8');
          this.cart.havePayTM = paytm && paytm.length > 0 ? true : false;
          this.cart.havePayPal = paypal && paypal.length > 0 ? true : false;
          this.cart.haveStripe = stripe && stripe.length > 0 ? true : false;
          this.cart.haveRazor = razor && razor.length > 0 ? true : false;
          this.cart.haveCOD = cod && cod.length > 0 ? true : false;
          this.cart.haveInstamojo = insta && insta.length > 0 ? true : false;
          this.cart.havePayStack = paystack && paystack.length > 0 ? true : false;
          this.cart.haveFlutterwave = flutterwave && flutterwave.length > 0 ? true : false;
          if (this.cart.haveStripe) {
            // this.util.stripe = stripe;
            if (stripe) {
              const creds = JSON.parse(stripe[0].creds);
              if (stripe[0].env === '1') {
                this.util.stripe = creds.live;
              } else {
                this.util.stripe = creds.test;
              }
              if (this.util.userInfo && this.util.userInfo.stripe_key) {
                this.getCards();
              }
              this.util.stripeCode = creds && creds.code ? creds.code : 'USD';
            }
            console.log('============>>', this.util.stripe);
          }


          if (this.cart.haveInstamojo) {
            const datas = info.filter(x => x.id === '6');
            this.cart.instaENV = datas[0].env;
            if (insta) {
              const instaPay = JSON.parse(datas[0].creds);
              this.cart.instamojo = instaPay;
              console.log('instaMOJO', this.cart.instamojo);
            }
          }

          if (this.cart.havePayPal) {
            if (paypal) {
              const creds = JSON.parse(paypal[0].creds);
              if (paypal[0].env === '1') {
                this.cart.paypal = creds.live;
              } else {
                this.cart.paypal = creds.test;
              }
              if (this.cart.havePayPal) {
                this.initConfig();
              }
              this.cart.paypalCode = creds && creds.code ? creds.code : 'USD';
            }
          }

          if (this.cart.haveRazor) {
            if (razor) {
              const creds = JSON.parse(razor[0].creds);
              if (razor[0].env === '1') {
                this.cart.razor = creds.live;
              } else {
                this.cart.razor = creds.test;
              }
              if (this.cart.haveRazor) {
                this.initRazor();
              }
              this.cart.razorCode = creds && creds.code ? creds.code : 'INR';
            }
          }

          if (this.cart.havePayTM) {
            if (paytm) {
              const creds = JSON.parse(paytm[0].creds);
              this.cart.paytmENV = paytm[0].env;
              this.cart.paytmCreds = creds;
              console.log('creds=============>>>>>>>PAYRMMMMM', creds);
            }
          }

          if (this.cart.havePayStack) {
            if (paystack) {
              const creds = JSON.parse(paystack[0].creds);
              this.cart.paystack = creds;
              console.log('paystack creds=======>>>>>', this.cart.paystack);
            }
          }

          if (this.cart.haveFlutterwave) {
            if (flutterwave) {
              const creds = JSON.parse(flutterwave[0].creds);
              this.cart.flutterwave = creds;
              console.log('fluterwave creds=>>', this.cart.flutterwave);
            }
          }
        } else {
          this.cart.havePayment = false;
          this.util.errorMessage(this.util.translate('Something went wrong'));
        }
      } else {
        this.cart.havePayment = false;
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.cart.havePayment = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  initRazor() {
    this.razorpayService
      .lazyLoadLibrary('https://checkout.razorpay.com/v1/checkout.js')
      .subscribe();
  }

  getCards() {
    console.log(this.util.userInfo.stripe_key);
    this.api.httpGet('https://api.stripe.com/v1/customers/' + this.util.userInfo.stripe_key +
      '/sources?object=card', this.util.stripe).subscribe((cards: any) => {
        console.log(cards);
        if (cards && cards.data) {
          this.cards = cards.data;
          this.token = this.cards[0].id;
        }
      }, (error) => {
        console.log(error);
        if (error && error.error && error.error.error && error.error.error.message) {
          this.util.errorMessage(error.error.error.message);
          return false;
        }
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });
  }

  async createOrder(method, key) {
    const param = {
      address: JSON.stringify(this.cart.deliveryAddress),
      applied_coupon: this.cart.coupon && this.cart.coupon.discount ? 1 : 0,
      coupon_id: this.cart.coupon && this.cart.coupon.discount ? this.cart.coupon.id : 0,
      pay_method: method,
      did: '',
      delivery_charge: this.cart.deliveryPrice,
      discount: this.cart.discount && this.cart.discount != null ? this.cart.discount : 0,
      grand_total: this.cart.grandTotal,
      orders: JSON.stringify(this.cart.cart),
      paid: key,
      restId: this.cart.cartStoreInfo.uid,
      serviceTax: this.cart.orderTax,
      status: 'created',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      total: this.cart.totalPrice,
      uid: localStorage.getItem('uid'),
      notes: this.orderNotes
    };

    console.log('param----->', param);

    this.util.start();
    this.api.post('orders/save', param).then((data: any) => {
      console.log(data);
      this.util.stop();
      this.api.sendNotification('You have received new order', 'New Order Received', this.storeFCM);
      this.util.publishNewOrder();
      localStorage.removeItem('order_notes');
      localStorage.removeItem('selectedOffer');
      localStorage.removeItem('store_fcm');
      localStorage.removeItem('delivery_address');
      this.cart.clearCart();
      this.util.suucessMessage(this.util.translate('Order created'));
      this.router.navigate(['orders']);
    }, error => {
      console.log(error);
      this.util.stop();
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });

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

  async selectAddress(item) {

    const distance = await this.distanceInKmBetweenEarthCoordinates(parseFloat(this.cart.cartStoreInfo.lat),
      parseFloat(this.cart.cartStoreInfo.lng), parseFloat(item.lat), parseFloat(item.lng));
    console.log('distance', distance);
    const permittedDistance = parseInt(this.util.general.allowDistance);
    console.log('--', permittedDistance);
    if (distance <= permittedDistance) {
      console.log('distance is ok... you can order now');
      this.cart.deliveryAddress = item;
      this.cart.calcuate();
      this.toggle = 'rd2';
      this.cart.deliveryAddress = item;
      this.cart.calcuate();
    } else {
      this.util.errorMessage(this.util.translate('Distance between your address and restaurant address must be  ') +
        permittedDistance + this.util.translate(' KM'));
    }
  }

  addAddonCartQ(i, j) {
    console.log(this.cart.cart[i].selectedItem[j]);
    this.cart.cart[i].selectedItem[j].total = this.cart.cart[i].selectedItem[j].total + 1;
    this.cart.calcuate();
  }

  addCartQ(index) {
    console.log(this.cart.cart[index]);
    this.cart.cart[index].quantiy = this.cart.cart[index].quantiy + 1;
    this.cart.calcuate();
  }

  removeCartQ(index) {
    if (this.cart.cart[index].quantiy !== 0) {
      this.cart.cart[index].quantiy = this.cart.cart[index].quantiy - 1;
      if (this.cart.cart[index].quantiy === 0) {
        this.cart.removeItem(this.cart.cart[index].id);
      }
    } else {
      this.cart.cart[index].quantiy = 0;
      if (this.cart.cart[index].quantiy === 0) {
        this.cart.removeItem(this.cart.cart[index].id);
      }
    }
    if (this.cart.cart.length === 0) {
      this.navCtrl.back();
    }
    if (this.cart.totalPrice < this.cart.minOrderPrice) {
      let text;
      if (this.util.cside === 'left') {
        text = this.util.currecny + ' ' + this.cart.minOrderPrice;
      } else {
        text = this.cart.minOrderPrice + ' ' + this.util.currecny;
      }
      Swal.fire({
        title: this.util.translate('Error'),
        text: this.util.translate('Minimum order amount must be ') + text + this.util.translate(' or more'),
        icon: 'error',
        showConfirmButton: true,
        confirmButtonText: this.util.translate('OK'),
        backdrop: false,
        background: 'white'
      }).then(status => {
        if (status && status.value) {

        }
      });
      this.navCtrl.back();
    }
    this.cart.calcuate();
  }

  getOffers() {
    this.api.get('offers').then(data => {
      console.log('list=====>', data);
      this.offers = [];
      if (data && data.status === 200 && data.data.length) {
        const currnetDate = moment().format('YYYY-MM-DD');
        data.data.forEach(element => {
          console.log(moment(element.expire).isAfter(currnetDate));
          if (element && element.status === '1' && moment(element.expire).isAfter(currnetDate)) {
            console.log('yes=>', element);
            element.available = element.available.split(',');
            this.offers.push(element);
          }
        });
      }
    }).catch(error => {
      console.log(error);
    });
  }

  removeOffer() {
    this.cart.coupon = null;
    this.cart.calcuate();
    localStorage.removeItem('selectedOffer');
  }

  proceed() {
    console.log(this.payMethods);
    if (this.payMethods && this.payMethods !== '') {
      localStorage.setItem('store_fcm', this.storeFCM);
      localStorage.setItem('order_notes', this.orderNotes);
      localStorage.setItem('delivery_address', JSON.stringify(this.cart.deliveryAddress));
      if (this.payMethods === 'cod') {
        this.createOrder(this.payMethods, 'none');
      } else if (this.payMethods === 'stripe') {
        console.log('pay with stripe');
        this.frame.show();
      } else if (this.payMethods === 'razor') {
        this.razorPay();
      } else if (this.payMethods === 'paytm') {
        this.payTm();
      } else if (this.payMethods === 'instamojo') {
        this.instaPay();
      } else if (this.payMethods === 'paystacks') {
        this.paystackPay();
      } else if (this.payMethods === 'flutterPay') {
        this.flutterPay();
      }
    }
  }

  paystackPay() {
    const handler = PaystackPop.setup({
      key: this.cart.paystack.pk,
      email: this.util.userInfo.email,
      amount: this.cart.grandTotal * 100,
      firstname: this.util.userInfo.first_name,
      lastname: this.util.userInfo.last_name,
      ref: '' + Math.floor((Math.random() * 1000000000) + 1),
      onClose: () => {
        console.log('closed');
      },
      callback: (response) => {
        console.log(response);
        // response.reference
        this.createOrder('paystack', response.reference);
      }
    });
    handler.openIframe();
  }

  getName() {
    return this.util.userInfo && this.util.userInfo.first_name ? this.util.userInfo.first_name + ' ' +
      this.util.userInfo.last_name : this.util.app_name + ' User';
  }

  getEmail() {
    return this.util.userInfo && this.util.userInfo.email ? this.util.userInfo.email : this.util.general.email;
  }

  instaPay() {
    let curl;
    if (this.cart.instaENV === '0') {
      curl = 'https://test.instamojo.com/api/1.1/payment-requests/';
    } else {
      curl = 'https://www.instamojo.com/api/1.1/payment-requests/';
    }
    const callbackURL = window.location.origin + '/instamojocallback?method=instamojo&';
    const param = {
      allow_repeated_payments: 'False',
      amount: this.cart.grandTotal,
      name: this.getName(),
      purpose: this.util.app_name + ' order',
      redirect_url: callbackURL,
      phone: this.util.userInfo && this.util.userInfo.mobile ? this.util.userInfo.mobile : '',
      send_email: 'True',
      webhook: this.api.baseUrl,
      send_sms: 'True',
      email: this.getEmail(),
      key: this.cart.instamojo.key,
      token: this.cart.instamojo.token,
      url: curl
    };

    this.util.start();
    this.api.post('users/instamojoRequest', param).then((data: any) => {
      console.log(data);
      this.util.stop();
      if (data && data.status === 200) {
        const info = JSON.parse(data.data);
        console.log('info', info);
        if (info && info.success === true) {
          window.open(info.payment_request.longurl, '_self');
        } else {
          this.util.errorMessage(this.util.translate('Something went wrong'));
        }
      } else {
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }
    }, error => {
      this.util.stop();
      this.util.errorMessage(this.util.translate('Something went wrong'));
      console.log(error);
    });
  }

  flutterPay() {
    const callbackURL = window.location.origin + '/flutterwavecallback?method=flutterwave&';

    FlutterwaveCheckout({
      public_key: this.cart.flutterwave.pk,
      tx_ref: '' + Math.floor((Math.random() * 1000000000) + 1),
      amount: this.cart.grandTotal,
      currency: this.cart.flutterwave.code,
      payment_options: 'card, mobilemoneyghana, ussd',
      redirect_url: // specified redirect URL
        callbackURL,
      meta: {
        consumer_id: 23,
        consumer_mac: '92a3-912ba-1192a',
      },
      customer: {
        email: this.getEmail(),
        phone_number: this.util.userInfo.mobile,
        name: this.getName(),
      },
      callback: (data) => {
        console.log(data);
      },
      onclose: () => {
        console.log('closed');
      },
      customizations: {
        title: this.util.app_name,
        description: this.util.app_name + ' order',
        logo: this.api.mediaURL + this.util.logo,
      },
    });
  }

  payTm() {
    // payFromWeb
    const orderId = this.util.makeid(20);
    const callbackURL = window.location.href + '?method=paytm&key=' + orderId;

    const param = {
      ORDER_ID: orderId,
      CUST_ID: localStorage.getItem('uid'),
      INDUSTRY_TYPE_ID: 'Retail',
      CHANNEL_ID: 'WAP',
      TXN_AMOUNT: this.cart.grandTotal ? this.cart.grandTotal : 5,
      callback: callbackURL
    };
    localStorage.setItem('payTMOrderID', orderId);
    console.log('to url===>', this.api.JSON_to_URLEncoded(param));
    const url = this.api.baseUrl + 'paytm/payFromWeb?' + this.api.JSON_to_URLEncoded(param);
    window.open(url, '_self');
  }

  public razorPay() {
    this.RAZORPAY_OPTIONS.key = this.cart.razor;
    this.RAZORPAY_OPTIONS.amount = this.cart.grandTotal * 100;
    this.RAZORPAY_OPTIONS.prefill.email = this.util.userInfo.email;

    this.RAZORPAY_OPTIONS['handler'] = this.razorPaySuccessHandler.bind(this);

    const razorpay = new Razorpay(this.RAZORPAY_OPTIONS);
    razorpay.open();
  }

  public razorPaySuccessHandler(response) {
    console.log('->', response);
    this.payId = response.razorpay_payment_id;
    this.createOrder('razor', this.payId);
    this.cd.detectChanges();
  }

  payWithCard() {
    console.log(this.token);
    if (this.token) {
      const options = {
        amount: Math.ceil(this.cart.grandTotal * 100),
        currency: this.util.stripeCode,
        customer: this.util.userInfo.stripe_key,
        card: this.token,
      };
      console.log('options', options);
      const url = 'https://api.stripe.com/v1/charges';
      this.util.start();
      this.api.externalPost(url, options, this.util.stripe).subscribe((data: any) => {
        console.log('------------------------->', data);
        this.payId = data.id;
        this.util.stop();
        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });

        Toast.fire({
          icon: 'success',
          title: this.util.translate('Payment Success')
        });
        this.createOrder('stripe', this.payId);
      }, (error) => {
        this.util.stop();
        console.log(error);
        if (error && error.error && error.error.error && error.error.error.message) {
          this.util.errorMessage(error.error.error.message);
          return false;
        }
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });
    } else {
      this.util.errorMessage(this.util.translate('Please select card'));
    }
  }

  addcard() {
    console.log('userinfo-=-.>>', this.util.userInfo);
    this.date = this.date.replace(/ /g, '');
    this.cnumber = this.cnumber.replace(/ /g, '');
    console.log('date============>', this.date.split('/'));
    console.log('cumner', this.cnumber);
    if (this.email === '' || this.cname === '' || this.cnumber === '' ||
      this.cvc === '' || this.date === '') {
      this.util.errorMessage(this.util.translate('All Fields are required'));
      return false;
    }
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!(emailfilter.test(this.email))) {
      this.util.errorMessage(this.util.translate('Please enter valid email'));

      return false;
    }
    const year = this.date.split('/')[1];
    const month = this.date.split('/')[0];
    if (this.util.userInfo && this.util.userInfo.stripe_key && this.util.userInfo.stripe_key !== '') {
      // add card op existing customer...
      console.log('add new card');
      const param = {
        'card[number]': this.cnumber,
        'card[exp_month]': month,
        'card[exp_year]': year,
        'card[cvc]': this.cvc
      };
      this.util.start();
      this.api.externalPost('https://api.stripe.com/v1/tokens', param, this.util.stripe).subscribe((data: any) => {
        console.log(data);
        if (data && data.id) {
          // this.token = data.id;
          const newCardInfo = {
            source: data.id
          };
          this.api.externalPost('https://api.stripe.com/v1/customers/' + this.util.userInfo.stripe_key + '/sources',
            newCardInfo, this.util.stripe).subscribe((data) => {
              console.log('new card addedd', data);
              this.addCard = false;
              this.util.stop();
              this.getCards();
            }, error => {
              console.log('error in new card', error);
              this.util.stop();
            });
        } else {
          this.util.stop();
        }
      }, (error: any) => {
        console.log(error);
        this.util.stop();
        console.log();
        if (error && error.error && error.error.error && error.error.error.message) {
          // this.util.showErrorAlert(error.error.error.message);
          this.util.errorMessage(error.error.error.message);
          return false;
        }
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });

    } else {
      /// create new customer.... and add new card
      const param = {
        'card[number]': this.cnumber,
        'card[exp_month]': month,
        'card[exp_year]': year,
        'card[cvc]': this.cvc
      };
      this.util.start();
      this.api.externalPost('https://api.stripe.com/v1/tokens', param, this.util.stripe).subscribe((data: any) => {
        console.log(data);
        if (data && data.id) {
          // this.token = data.id;
          const customer = {
            description: 'Customer for ' + this.util.app_name + ' app',
            source: data.id,
            email: this.email
          };
          this.api.externalPost('https://api.stripe.com/v1/customers', customer, this.util.stripe).subscribe((customer: any) => {
            console.log(customer);
            this.util.stop();
            if (customer && customer.id) {
              // this.cid = customer.id;
              const cid = {
                id: localStorage.getItem('uid'),
                stripe_key: customer.id
              };

              this.updateUser(cid);
            }
          }, error => {
            this.util.stop();
            console.log();
            if (error && error.error && error.error.error && error.error.error.message) {
              // this.util.showErrorAlert(error.error.error.message);
              this.util.errorMessage(error.error.error.message);
              return false;
            }
            this.util.errorMessage(this.util.translate('Something went wrong'));
          });
        } else {
          this.util.stop();
        }
      }, (error: any) => {
        console.log(error);
        this.util.stop();
        console.log();
        if (error && error.error && error.error.error && error.error.error.message) {
          // this.util.showErrorAlert(error.error.error.message);
          this.util.errorMessage(error.error.error.message);
          return false;
        }
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });
    }
  }

  updateUser(param) {
    this.util.start();
    this.api.post('users/edit_profile', param).then((data: any) => {
      this.util.stop();
      console.log(data);
      const getParam = {
        id: localStorage.getItem('uid')
      };
      this.api.post('users/getById', getParam).then((data: any) => {
        console.log('user info=>', data);
        if (data && data.status === 200 && data.data && data.data.length) {
          this.util.userInfo = data.data[0];
          // this.navCtrl.back();
        } else {
          // this.navCtrl.back();
        }
        this.addCard = false;
        this.getCards();
      }, error => {
        console.log(error);
      });
    }, error => {
      this.util.stop();
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  addAddress() {
    this.addressFromMap.hide();
    if (this.address === '' || this.landmark === '' || this.house === '' || this.pincode === '') {
      // this.util.toast('error', this.util.translate('Error'), this.util.translate('All Fields are required'));
      this.util.errorMessage(this.util.translate('All Fields are required'));
      return false;
    }
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode({ address: this.house + ' ' + this.landmark + ' ' + this.address + ' ' + this.pincode }, (results, status) => {
      console.log(results, status);
      if (status === 'OK' && results && results.length) {
        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();
        console.log('----->', this.lat, this.lng);
        console.log('call api');
        this.util.start();
        const param = {
          uid: localStorage.getItem('uid'),
          address: this.address,
          lat: this.lat,
          lng: this.lng,
          title: this.title,
          house: this.house,
          landmark: this.landmark,
          pincode: this.pincode
        };
        this.api.post('address/save', param).then((data: any) => {
          this.util.stop();

          if (data && data.status === 200) {
            // this.navCtrl.back();
            this.getAddress();
            // this.util.showToast('Address added', 'success', 'bottom');
            const Toast = Swal.mixin({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              onOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });

            Toast.fire({
              icon: 'success',
              title: this.util.translate('Address added')
            });
          } else {
            this.util.errorMessage(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.util.stop();
          this.util.errorMessage(this.util.translate('Something went wrong'));
        });
      } else {
        this.util.errorMessage(this.util.translate('Something went wrong'));
        return false;
      }
    });
  }

  onSearchChange(event) {
    console.log(event);
    if (this.query === '') {
      this.autocompleteItems1 = [];
      return;
    }
    const addsSelected = localStorage.getItem('addsSelected');
    if (addsSelected && addsSelected != null) {
      localStorage.removeItem('addsSelected');
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions({ input: this.query }, (predictions, status) => {
      console.log(predictions);
      if (predictions && predictions.length > 0) {
        this.autocompleteItems1 = predictions;
        console.log(this.autocompleteItems1);
      }
    });
  }

  selectSearchResult1(item) {
    console.log('select', item);
    localStorage.setItem('addsSelected', 'true');
    this.autocompleteItems1 = [];
    this.query = item.description;
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        console.log(status);
        this.address = this.query;
        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();
        this.changedPlace.hide();
        this.addressFromMap.show();
        this.cd.detectChanges();
        this.loadMap(this.lat, this.lng);
      }
    });
  }

  getTime(time) {
    return moment(time).format('LLLL');
  }

  selectedOffers(item) {
    console.log(item, this.cart.cartStoreInfo);
    console.log(this.cart.cart[0].restId);
    if (item && item.available && item.available.length) {
      const data = item.available.includes(this.cart.cart[0].restId);
      console.log(data);
      if (data) {
        if (this.cart.totalPrice >= item.min) {
          console.log('ok');
          localStorage.setItem('selectedOffer', JSON.stringify(item));
          this.offersModal.hide();
          this.util.suucessMessage(this.util.translate('Coupon Applied'));
          this.util.publishCoupon(item);
        } else {
          this.util.errorMessage(this.util.translate('For claiming this coupon your order required minimum order  of $') + item.min);
        }
      } else {
        this.util.errorMessage(this.util.translate('This coupon is not valid for ') + this.cart.cartStoreInfo.name);
      }
    } else {
      this.util.errorMessage(this.util.translate('This coupon is not valid for ') + this.cart.cartStoreInfo.name);
    }
  }
}
