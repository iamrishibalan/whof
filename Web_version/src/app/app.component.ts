
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationExtras, NavigationStart, Router, RouterEvent } from '@angular/router';
import { ApiService } from './services/api.service';
import { CartService } from './services/cart.service';
import { UtilService } from './services/util.service';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { ModalDirective } from 'angular-bootstrap-md';
import { login } from './interfaces/login';
import { mobile } from './interfaces/mobile';
import { mobileLogin } from './interfaces/mobileLogin';
import { register } from './interfaces/register';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
declare var google;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('verifyModal') public verifyModal: ModalDirective;
  @ViewChild('registerModal') public registerModal: ModalDirective;
  @ViewChild('loginModal') public loginModal: ModalDirective;
  @ViewChild('otpModal') public otpModal: ModalDirective;
  @ViewChild('locationModal') public locationModal: ModalDirective;
  @ViewChild('forgotPwd') public forgotPwd: ModalDirective;
  @ViewChild('sideMenu') public sideMenu: ModalDirective;
  @ViewChild('basicModal') public basicModal: ModalDirective;
  @ViewChild('scrollMe') private scrollMe: ElementRef;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  login: login = { email: '', password: '' };
  mobile: mobile = { ccCode: this.api.default_country_code, phone: '', password: '' };
  mobileLogin: mobileLogin = { ccCode: this.api.default_country_code, phone: '' };
  registerForm: register = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    gender: '1',
    mobile: '',
    fcm_token: '',
    type: '',
    lat: '',
    lng: '',
    cover: '',
    status: '',
    verified: '',
    others: '',
    date: '',
    stripe_key: '',
    cc: this.api.default_country_code,
    check: false
  };
  viewAcc = false;
  autocomplete1: string;
  autocompleteItems1: any = [];
  GoogleAutocomplete;
  geocoder: any;
  submitted = false;
  ccCode: any;
  userCode: any = '';
  resendCode: boolean;
  otpId: any;
  uid: any;

  languageClicked: boolean = false;
  title = 'S2ftech';
  loaded: boolean;
  loading = true;
  deviceType = 'desktop';
  innerHeight: string;
  windowWidth: number;

  verticalNavType = 'expanded';
  verticalEffect = 'shrink';
  isLogin: boolean = false;

  div_type;
  sent: boolean;
  reset_email: any;
  reset_otp: any;
  reset_myOPT: any;
  reset_verified: any;
  reset_userid: any;
  reset_password: any;
  reset_repass: any;
  reset_loggedIn: boolean;
  reset_id: any;

  reset_phone: any;
  reset_cc: any = this.api.default_country_code;

  name: any;
  msg: any = '';
  messages: any[] = [];
  uid_chat: any;
  id_chat: any;
  loaded_chat: boolean;
  yourMessage: boolean;
  interval: any;
  router$: Subscription;
  constructor(
    public api: ApiService,
    public util: UtilService,
    public cart: CartService,
    private router: Router,
    private titleService: Title,
    private chmod: ChangeDetectorRef
  ) {
    this.div_type = 1;
    const scrollHeight = window.screen.height - 150;
    this.innerHeight = scrollHeight + 'px';
    this.windowWidth = window.innerWidth;
    this.setMenuAttributs(this.windowWidth);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      console.log('end--->');
      window.scrollTo(10, 10);
    });
    this.router.events.subscribe((e: RouterEvent) => {
      this.navigationInterceptor(e);
    });
    this.resendCode = false;
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
    this.autocomplete1 = '';
    this.autocompleteItems1 = [];
    this.util.subscribeAddressPopup().subscribe(() => {
      this.locationModal.show();
    });
    this.util.subscribeModalPopup().subscribe((data) => {
      console.log('data', data);
      if (data && data === 'location') {
        this.locationModal.show();
      } else if (data && data === 'login') {
        this.loginModal.show();
      } else if (data && data === 'register') {
        this.registerModal.show();
      } else if (data && data === 'sideMenu') {
        this.sideMenu.show();
      }
    });
    this.initializeApp();
  }

  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      console.log('start-----><>');
      this.loading = true;
      this.util.start();
      this.loaded = false;
    }
    if (event instanceof NavigationEnd) {
      console.log('endedd--->>>>')
      this.loading = false;
      this.util.stop();
      this.loaded = true;
      window.scrollTo(0, 0);
      const data = this.getTitle(this.router.routerState, this.router.routerState.root);
      this.titleService.setTitle(data && data[0] ? this.util.translate(data[0]) + ' | S2ftech Full App By initappz' :
        this.util.translate('Home') + ' | S2ftech Full App By initappz');
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false;
      this.util.stop();
      this.loaded = true;
    }
    if (event instanceof NavigationError) {
      this.loading = false;
      this.util.stop();
      this.loaded = true;
    }
  }

  getTitle(state, parent) {
    const data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }

  onResize(event) {
    this.innerHeight = event.target.innerHeight + 'px';
    /* menu responsive */
    this.windowWidth = event.target.innerWidth;
    let reSizeFlag = true;
    if (this.deviceType === 'tablet' && this.windowWidth >= 768 && this.windowWidth <= 1024) {
      reSizeFlag = false;
    } else if (this.deviceType === 'mobile' && this.windowWidth < 768) {
      reSizeFlag = false;
    }
    this.util.deviceType = this.deviceType;
    if (reSizeFlag) {
      this.setMenuAttributs(this.windowWidth);
    }
  }

  setMenuAttributs(windowWidth) {
    if (windowWidth >= 768 && windowWidth <= 1024) {
      this.deviceType = 'mobile';
      this.verticalNavType = 'offcanvas';
      this.verticalEffect = 'push';
    } else if (windowWidth < 768) {
      this.deviceType = 'mobile';
      this.verticalNavType = 'offcanvas';
      this.verticalEffect = 'overlay';
    } else {
      this.deviceType = 'desktop';
      this.verticalNavType = 'expanded';
      this.verticalEffect = 'shrink';
    }
    this.util.deviceType = this.deviceType;
    console.log('type', this.util.deviceType);
  }

  private smoothScrollTop(): void {
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  private onRouteUpdated(event: any): void {
    if (event instanceof NavigationEnd) {
      this.smoothScrollTop();
    }
  }

  ngOnInit() {
    this.router$ = this.router.events.subscribe(next => this.onRouteUpdated(next));
  }

  initializeApp() {
    this.util.cityAddress = localStorage.getItem('address');
    console.log('%c Copyright and Good Faith Purchasers © 2020-present initappz. ', 'background: #222; color: #bada55');
    const lng = localStorage.getItem('language');
    if (!lng || lng === null) {
      this.api.get('users/getDefaultSettings').then((data: any) => {
        console.log('----------------- app setting', data);
        if (data && data.status === 200 && data.data) {
          const manage = data.data.manage;
          const language = data.data.lang;
          if (manage && manage.length > 0) {
            if (manage[0].app_close === 0 || manage[0].app_close === '0') {
              this.util.appClosed = true;
              this.util.appClosedMessage = manage[0].message;
            } else {
              this.util.appClosed = false;
            }
          } else {
            this.util.appClosed = false;
          }
          if (language) {
            this.util.translations = language;
            localStorage.setItem('language', data.data.file);
          }
          const settings = data.data.settings;
          if (settings && settings.length > 0) {
            const info = settings[0];
            this.util.direction = info.appDirection;
            this.util.cside = info.currencySide;
            this.util.currecny = info.currencySymbol;
            this.util.logo = info.logo;
            this.util.twillo = info.twillo;
            this.util.delivery = info.delivery;
            this.util.user_login = info.web_login;
            this.util.home_type = info.home_ui;
            this.util.reset_pwd = info.reset_pwd;
            document.documentElement.dir = this.util.direction;
          } else {
            this.util.direction = 'ltr';
            this.util.cside = 'right';
            this.util.currecny = '$';
            document.documentElement.dir = this.util.direction;
          }

          const general = data.data.general;
          console.log('generalllll============================>', general, this.util.reset_pwd);
          if (general && general.length > 0) {
            const info = general[0];
            this.util.general = info;
            this.cart.minOrderPrice = parseFloat(info.min);
            this.cart.shipping = info.shipping;
            this.cart.shippingPrice = parseFloat(info.shippingPrice);
            this.cart.orderTax = parseFloat(info.tax);
            this.cart.flatTax = parseInt(info.tax);
            this.cart.freeShipping = parseFloat(info.free);
            this.util.facebook_link = info.facebook;
            this.util.instagram_link = info.instagram;
            this.util.twitter_link = info.twitter;
            this.util.google_playstore = info.google_playstore;
            this.util.apple_appstore = info.apple_appstore;
            this.util.web_footer = info.web_footer;
          }
        }
      }, error => {
        console.log('default settings', error);
      });
    } else {
      const param = {
        id: localStorage.getItem('language')
      };
      this.api.post('users/getDefaultSettingsById', param).then((data: any) => {
        console.log('----------------- app setting', data);
        if (data && data.status === 200 && data.data) {
          const manage = data.data.manage;
          const language = data.data.lang;
          if (manage && manage.length > 0) {
            if (manage[0].app_close === 0 || manage[0].app_close === '0') {
              this.util.appClosed = true;
              this.util.appClosedMessage = manage[0].message;
            } else {
              this.util.appClosed = false;
            }
          } else {
            this.util.appClosed = false;
          }
          if (language) {
            this.util.translations = language;
          }
          const settings = data.data.settings;
          if (settings && settings.length > 0) {
            const info = settings[0];
            this.util.direction = info.appDirection;
            this.util.cside = info.currencySide;
            this.util.currecny = info.currencySymbol;
            this.util.logo = info.logo;
            this.util.twillo = info.twillo;
            this.util.delivery = info.delivery;
            this.util.user_login = info.web_login;
            this.util.home_type = info.home_ui;
            this.util.reset_pwd = info.reset_pwd;
            document.documentElement.dir = this.util.direction;

          } else {
            this.util.direction = 'ltr';
            this.util.cside = 'right';
            this.util.currecny = '$';
            document.documentElement.dir = this.util.direction;
          }
          const general = data.data.general;
          console.log('generalllll============================>', general, this.util.reset_pwd);
          if (general && general.length > 0) {
            const info = general[0];
            this.util.general = info;
            this.cart.minOrderPrice = parseFloat(info.min);
            this.cart.shipping = info.shipping;
            this.cart.shippingPrice = parseFloat(info.shippingPrice);
            this.cart.orderTax = parseFloat(info.tax);
            this.cart.flatTax = parseInt(info.tax);
            this.cart.freeShipping = parseFloat(info.free);
            this.util.facebook_link = info.facebook;
            this.util.instagram_link = info.instagram;
            this.util.twitter_link = info.twitter;
            this.util.google_playstore = info.google_playstore;
            this.util.apple_appstore = info.apple_appstore;
            this.util.web_footer = info.web_footer;
          }
        }
      }, error => {
        console.log('default settings by id', error);
        this.util.appClosed = false;
        this.util.direction = 'ltr';
        this.util.cside = 'right';
        this.util.currecny = '$';
        document.documentElement.dir = this.util.direction;
      });
    }

    this.getLangs();
    const uid = localStorage.getItem('uid');
    if (uid && uid !== null && uid !== 'null') {
      const param = {
        id: uid
      };
      this.api.post('users/getById', param).then((data: any) => {
        console.log('*******************', data);
        if (data && data.status === 200 && data.data && data.data.length && data.data[0].type === 'user') {
          this.util.userInfo = data.data[0];
        } else {
          localStorage.removeItem('uid');
        }
      }, error => {
        localStorage.removeItem('uid');
        console.log(error);
      });
    }

  }

  getLangs() {
    this.api.get('lang').then((data: any) => {
      console.log('data--->>> languages??===??', data);
      if (data && data.status === 200 && data.data.length) {
        this.util.languages = data.data;
      }
    }, error => {
      console.log(';error in languge', error);
    }).catch((error => {
      console.log('error->>>', error);
    }))
  }

  locate(modal) {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          console.log(position);
          // modal.hide();
          this.locationModal.hide();
          this.getAddressOf(position.coords.latitude, position.coords.longitude);
        },
        error => {
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
    };
  }

  onSearchChange(event) {
    console.log(event);
    if (this.autocomplete1 === '') {
      this.autocompleteItems1 = [];
      return;
    }
    const addsSelected = localStorage.getItem('addsSelected');
    if (addsSelected && addsSelected != null) {
      localStorage.removeItem('addsSelected');
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete1 }, (predictions, status) => {
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
    this.autocomplete1 = item.description;
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        console.log(status);
        localStorage.setItem('location', 'true');
        localStorage.setItem('lat', results[0].geometry.location.lat());
        localStorage.setItem('lng', results[0].geometry.location.lng());
        localStorage.setItem('address', this.autocomplete1);
        this.locationModal.hide();
        this.chmod.detectChanges();
        this.util.publishNewAddress();
        this.router.navigate(['']);
      }
    });
  }

  getAddressOf(lat, lng) {

    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(lat, lng);
    geocoder.geocode({ 'location': location }, (results, status) => {
      console.log(results);
      console.log('status', status);
      if (results && results.length) {
        localStorage.setItem('location', 'true');
        localStorage.setItem('lat', lat);
        localStorage.setItem('address', results[0].formatted_address);
        localStorage.setItem('lng', lng);
        this.util.publishNewAddress();
        this.router.navigate(['restaurants']);
      }
    });
  }

  loginWithEmailPassword(form: NgForm, modal) {
    console.log('form', form, this.login);
    this.submitted = true;
    if (form.valid && this.login.email && this.login.password) {
      console.log('valid');
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.errorMessage(this.util.translate('Please enter valid email'));
        return false;
      }
      console.log('login');

      this.isLogin = true;
      this.api.post('users/login', this.login).then((data: any) => {
        this.isLogin = false;
        console.log(data);
        if (data && data.status === 200) {
          if (data && data.data && data.data.type === 'user') {
            if (data.data.status === '1') {
              localStorage.setItem('uid', data.data.id);
              this.util.userInfo = data.data;
              const fcm = localStorage.getItem('fcm');
              if (fcm && fcm !== null && fcm !== 'null') {
                const updateParam = {
                  id: data.data.id,
                  fcm_token: fcm
                };
                this.api.post('users/edit_profile', updateParam).then((data: any) => {
                  console.log('user info=>', data);
                }, error => {
                  console.log(error);
                });
              }

              const favParam = {
                id: data.data.id
              }
              this.api.post('favourite/getByUid', favParam).then((data: any) => {
                console.log('fav data', data);
                if (data && data.status === 200 && data.data.length > 0) {
                  this.util.haveFav = true;
                  try {
                    this.util.favIds = data.data[0].ids.split(',');
                  } catch (error) {
                    console.log('eroor', error);
                  }
                } else {
                  this.util.haveFav = false;
                }
              }, error => {
                this.util.haveFav = false;
                console.log('fav error', error);
              });
              modal.hide();
            } else {
              console.log('not valid');
              modal.hide();
              Swal.fire({
                title: this.util.translate('Error'),
                text: this.util.translate('Your are blocked please contact administrator'),
                icon: 'error',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: this.util.translate('Need Help?'),
                backdrop: false,
                background: 'white'
              }).then(status => {
                if (status && status.value) {
                  console.log('uiddd----<<<', data.data.id);
                  this.id_chat = 0;
                  this.uid_chat = data.data.id;
                  this.loaded_chat = false;
                  this.name = 'Support';
                  this.getInbox();
                  this.interval = setInterval(() => {
                    console.log('calling in interval');
                    this.getInbox();
                  }, 12000);
                  this.basicModal.show();
                }
              });
            }
          } else {
            this.util.errorMessage(this.util.translate('Not valid user'));
          }
        } else if (data && data.status === 500) {
          this.util.errorMessage(data.data.message);
        } else {
          this.util.errorMessage(this.util.translate('Something went wrong'));
        }
      }, error => {
        this.isLogin = false;
        console.log(error);

        this.util.errorMessage(this.util.translate('Something went wrong'));
      });

    } else {
      console.log('not valid');
    }
  }

  loginWithMobileAndPassword(form: NgForm, modal) {
    console.log('form', form, this.mobile);
    this.submitted = true;
    if (form.valid && this.mobile.ccCode && this.mobile.phone && this.mobile.password) {
      console.log('valid');
      const param = {
        cc: '+' + this.mobile.ccCode,
        mobile: this.mobile.phone,
        password: this.mobile.password
      };
      this.isLogin = true;
      this.api.post('users/loginWithPhoneAndPassword', param).then((data) => {
        this.isLogin = false;
        console.log(data);
        if (data && data.status === 200) {
          if (data && data.data && data.data.type === 'user') {
            if (data.data.status === '1') {
              localStorage.setItem('uid', data.data.id);
              this.util.userInfo = data.data;
              const fcm = localStorage.getItem('fcm');
              if (fcm && fcm !== null && fcm !== 'null') {
                const updateParam = {
                  id: data.data.id,
                  fcm_token: fcm
                };
                this.api.post('users/edit_profile', updateParam).then((data: any) => {
                  console.log('user info=>', data);
                }, error => {
                  console.log(error);
                });
              }
              modal.hide();
              const favParam = {
                id: data.data.id
              }
              this.api.post('favourite/getByUid', favParam).then((data: any) => {
                console.log('fav data', data);
                if (data && data.status === 200 && data.data.length > 0) {
                  this.util.haveFav = true;
                  try {
                    this.util.favIds = data.data[0].ids.split(',');
                  } catch (error) {
                    console.log('eroor', error);
                  }
                } else {
                  this.util.haveFav = false;
                }
              }, error => {
                this.util.haveFav = false;
                console.log('fav error', error);
              });

            } else {
              modal.hide();
              console.log('not valid');
              Swal.fire({
                title: this.util.translate('Error'),
                text: this.util.translate('Your are blocked please contact administrator'),
                icon: 'error',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: this.util.translate('Need Help?'),
                backdrop: false,
                background: 'white'
              }).then(status => {
                if (status && status.value) {
                  console.log('uiddd----<<<', data.data.id);
                  this.id_chat = 0;
                  this.uid_chat = data.data.id;
                  this.loaded_chat = false;
                  this.name = 'Support';
                  this.getInbox();
                  this.interval = setInterval(() => {
                    console.log('calling in interval');
                    this.getInbox();
                  }, 12000);
                  this.basicModal.show();
                }
              });
            }
          } else {
            this.util.errorMessage(this.util.translate('Not valid user'));
            this.login.email = '';
            this.login.password = '';
          }
        } else if (data && data.status === 500) {
          this.util.errorMessage(data.data.message);
        } else {
          this.util.errorMessage(this.util.translate('Something went wrong'));
        }
      }, error => {
        console.log(error);
        this.isLogin = false;
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.isLogin = false;
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });
    } else {
      console.log('not valid');
    }
  }

  otpLogin() {


    console.log(this.userCode);
    if (this.userCode === '' || !this.userCode) {
      this.util.errorMessage(this.util.translate('Not valid code'));
      return false;
    }
    if (this.userCode) {
      const param = {
        id: this.otpId,
        otp: this.userCode
      };
      this.isLogin = true;
      this.api.post('users/verifyOTP', param).then((data: any) => {
        console.log(data);
        this.isLogin = false;
        if (data && data.status === 200) {
          const param = {
            id: this.uid
          };
          this.api.post('users/getById', param).then((data: any) => {
            console.log('user data', data);
            if (data && data.status === 200 && data.data && data.data.length && data.data[0].type === 'user') {
              this.util.userInfo = data.data[0];
              if (data && data.data && data.data[0].type === 'user') {
                if (data.data[0].status === '1') {
                  localStorage.setItem('uid', this.uid);
                  const fcm = localStorage.getItem('fcm');
                  if (fcm && fcm !== null && fcm !== 'null') {
                    const updateParam = {
                      id: this.uid,
                      fcm_token: fcm
                    };
                    this.api.post('users/edit_profile', updateParam).then((data: any) => {
                      console.log('user info=>', data);
                    }, error => {
                      console.log(error);
                    });
                  }
                  this.otpModal.hide();
                  this.loginModal.hide();
                  const favParam = {
                    id: this.uid
                  }
                  this.api.post('favourite/getByUid', favParam).then((data: any) => {
                    console.log('fav data', data);
                    if (data && data.status === 200 && data.data.length > 0) {
                      this.util.haveFav = true;
                      try {
                        this.util.favIds = data.data[0].ids.split(',');
                      } catch (error) {
                        console.log('eroor', error);
                      }
                    } else {
                      this.util.haveFav = false;
                    }
                  }, error => {
                    this.util.haveFav = false;
                    console.log('fav error', error);
                  });

                } else {
                  console.log('not valid');
                  this.otpModal.hide();
                  this.loginModal.hide();
                  Swal.fire({
                    title: this.util.translate('Error'),
                    text: this.util.translate('Your are blocked please contact administrator'),
                    icon: 'error',
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: this.util.translate('Need Help?'),
                    backdrop: false,
                    background: 'white'
                  }).then(status => {
                    if (status && status.value) {
                      this.id_chat = 0;
                      this.uid_chat = data.data.id;
                      this.loaded_chat = false;
                      this.name = 'Support';
                      this.getInbox();
                      this.interval = setInterval(() => {
                        console.log('calling in interval');
                        this.getInbox();
                      }, 12000);
                      this.basicModal.show();
                    }
                  });
                }
              } else {
                this.util.errorMessage(this.util.translate('Not valid user'));
                this.login.email = '';
                this.login.password = '';
              }
            } else if (data && data.status === 500) {
              this.util.errorMessage(data.data.message);
            } else {
              this.util.errorMessage(this.util.translate('Something went wrong'));
            }
          }, error => {
            localStorage.removeItem('uid');
            console.log(error);
          });
        } else {
          if (data && data.status === 500 && data.data && data.data.message) {
            this.util.errorMessage(data.data.message);
            return false;
          }
          this.util.errorMessage(this.util.translate('Something went wrong'));
          return false;
        }
      }, error => {
        this.isLogin = false;
        console.log(error);
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });
    } else {
      this.util.errorMessage(this.util.translate('Not valid code'));
      return false;
    }
  }

  loginWithMobileAndOTP(form: NgForm, modal) {
    console.log('form', form, this.mobileLogin);
    this.submitted = true;
    if (form.valid && this.mobileLogin.ccCode && this.mobileLogin.phone) {
      console.log('valid');
      const param = {
        mobile: this.mobileLogin.phone,
        cc: '+' + this.mobileLogin.ccCode
      };
      this.isLogin = true;
      this.api.post('users/checkMobileNumber', param).then((data) => {
        this.isLogin = false;
        console.log(data);
        if (data && data.status === 200) {
          console.log('open modal');
          this.uid = data.data.id;
          this.sendOTP2();
          setTimeout(() => {
            this.resendCode = true;
          }, 30000);
          this.otpModal.show();
        } else if (data && data.status === 500) {
          this.util.errorMessage(data.data.message);
        } else {
          this.util.errorMessage(this.util.translate('Something went wrong'));
        }
      }, error => {
        console.log(error);
        this.isLogin = false;
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.isLogin = false;
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });
    } else {
      console.log('not valid');
    }
  }

  onOtpChange(event) {
    console.log(event);
    this.userCode = event;
  }

  resend() {
    this.sendOTP();
  }

  resend2() {
    this.sendOTP2();
  }

  sendOTP() {
    const message = this.util.translate('Your S2ftech app verification code : ');
    const param = {
      msg: message,
      to: '+' + this.registerForm.cc + this.registerForm.mobile
    };
    console.log(param);

    console.log('hide');
    this.util.start();
    this.api.post('users/twilloMessage', param).then((data: any) => {
      console.log(data);
      this.otpId = data.data.id;
      this.util.stop();
    }, error => {
      console.log(error);
      this.util.stop();
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  sendOTP2() {
    const message = this.util.translate('Your S2ftech app verification code : ');
    const param = {
      msg: message,
      to: '+' + this.mobileLogin.ccCode + this.mobileLogin.phone
    };
    console.log(param);

    console.log('hide');
    this.util.start();
    this.api.post('users/twilloMessage', param).then((data: any) => {
      console.log(data);
      this.otpId = data.data.id;
      this.util.stop();
    }, error => {
      console.log(error);
      this.util.stop();
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }
  verify() {

    console.log(this.userCode);
    if (this.userCode === '' || !this.userCode) {
      this.util.errorMessage(this.util.translate('Not valid code'));
      return false;
    }
    if (this.userCode) {
      const param = {
        id: this.otpId,
        otp: this.userCode
      };
      this.isLogin = true;
      this.api.post('users/verifyOTP', param).then((data: any) => {
        console.log(data);
        this.isLogin = false;
        if (data && data.status === 200) {
          const registerParam = {
            first_name: this.registerForm.first_name,
            last_name: this.registerForm.last_name,
            email: this.registerForm.email,
            password: this.registerForm.password,
            gender: this.registerForm.gender,
            fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : 'NA',
            type: 'user',
            lat: '',
            lng: '',
            cover: 'NA',
            mobile: this.registerForm.mobile,
            status: 1,
            country_code: '+' + this.registerForm.cc,
            verified: 0,
            others: 1,
            date: moment().format('YYYY-MM-DD'),
            stripe_key: ''
          };

          console.log('param', registerParam);
          this.util.start();
          this.api.post('users/registerUser', registerParam).then((data: any) => {
            this.util.stop();
            console.log(data);
            if (data && data.status === 200) {
              this.util.userInfo = data.data;
              localStorage.setItem('uid', data.data.id);
              const fcm = localStorage.getItem('fcm');
              if (fcm && fcm !== null && fcm !== 'null') {
                const updateParam = {
                  id: data.data.id,
                  fcm_token: fcm
                };
                this.api.post('users/edit_profile', updateParam).then((data: any) => {
                  console.log('user info=>', data);
                }, error => {
                  console.log(error);
                });
              }
              this.sendVerification(this.login.email, this.api.baseUrl + 'users/verify?uid=' + data.data.id);
              this.verifyModal.hide();
              this.registerModal.hide();
            } else if (data && data.status === 500) {
              this.util.errorMessage(data.data.message);
            } else {
              this.util.errorMessage(this.util.translate('Something went wrong'));
            }
          }, error => {
            console.log(error);
            this.util.stop();
            this.util.errorMessage(this.util.translate('Something went wrong'));
          });
        } else {
          if (data && data.status === 500 && data.data && data.data.message) {
            this.util.errorMessage(data.data.message);
            return false;
          }
          this.util.errorMessage(this.util.translate('Something went wrong'));
          return false;
        }
      }, error => {
        this.isLogin = false;
        console.log(error);
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });
    } else {
      this.util.errorMessage(this.util.translate('Not valid code'));
      return false;
    }
  }

  onRegister(form: NgForm, registerModal, verification) {
    console.log(form);

    console.log('form', this.registerForm, this.ccCode);
    console.log(this.util.twillo);
    this.submitted = true;
    console.log(this.registerForm.check);
    if (form.valid && this.registerForm.check && this.registerForm.email && this.registerForm.password && this.registerForm.first_name
      && this.registerForm.last_name && this.registerForm.mobile && this.registerForm.cc) {
      console.log('valid data');
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.registerForm.email)) {
        this.util.errorMessage(this.util.translate('Please enter valid email'));
        return false;
      }
      if (this.util.twillo === '1') {
        console.log('open model=>>>');
        const param = {
          email: this.login.email,
          phone: this.registerForm.mobile
        };
        this.isLogin = true;
        this.api.post('users/validatePhoneAndEmail', param).then((data: any) => {
          this.isLogin = false;
          console.log('data', data);
          if (data && data.status === 200) {
            console.log('all done...');
            setTimeout(() => {
              this.resendCode = true;
            }, 30000);
            this.sendOTP();
            verification.show();
          } else if (data && data.status === 500) {
            this.util.errorMessage(data.data.message);
          } else {
            this.util.errorMessage(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.isLogin = false;
          this.util.errorMessage(this.util.translate('Something went wrong'));
        }).catch(error => {
          console.log(error);
          this.isLogin = false;
          this.util.errorMessage(this.util.translate('Something went wrong'));
        });
      } else {
        console.log('login');
        const param = {
          first_name: this.registerForm.first_name,
          last_name: this.registerForm.last_name,
          email: this.registerForm.email,
          password: this.registerForm.password,
          gender: this.registerForm.gender,
          fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : 'NA',
          type: 'user',
          lat: '',
          lng: '',
          cover: 'NA',
          mobile: this.registerForm.mobile,
          status: 1,
          country_code: '+' + this.registerForm.cc,
          verified: 0,
          others: 1,
          date: moment().format('YYYY-MM-DD'),
          stripe_key: ''
        };

        console.log('param', param);
        this.isLogin = true;
        this.api.post('users/registerUser', param).then((data: any) => {
          this.isLogin = false;
          console.log(data);
          if (data && data.status === 200) {
            this.util.userInfo = data.data;
            localStorage.setItem('uid', data.data.id);
            const fcm = localStorage.getItem('fcm');
            if (fcm && fcm !== null && fcm !== 'null') {
              const updateParam = {
                id: data.data.id,
                fcm_token: fcm
              };
              this.api.post('users/edit_profile', updateParam).then((data: any) => {
                console.log('user info=>', data);
              }, error => {
                console.log(error);
              });
            }
            registerModal.hide();
            this.sendVerification(this.login.email, this.api.baseUrl + 'users/verify?uid=' + data.data.id);

          } else if (data && data.status === 500) {
            this.util.errorMessage(data.data.message);
          } else {
            this.util.errorMessage(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.isLogin = false;
          this.util.errorMessage(this.util.translate('Something went wrong'));
        });
      }
    } else {
      console.log('not valid data...');
    }
  }

  sendVerification(mail, link) {
    const param = {
      email: mail,
      url: link
    };

    this.api.post('users/sendVerificationMail', param).then((data) => {
      console.log('mail', data);
    }, error => {
      console.log(error);
    });
  }

  openLink(type) {
    if (type === 'eula') {
      window.open('https://initappz.com/S2ftechaagya/eula.html');
    } else {
      window.open('https://initappz.com/S2ftechaagya/privacy.html');
    }
  }

  // reset password
  sendResetLink() {
    console.log(this.reset_email, ';sendOTPDriver');
    if (!this.reset_email) {
      this.util.errorMessage(this.util.translate('email is required'));
      return false;
    }
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailfilter.test(this.reset_email)) {
      this.util.errorMessage(this.util.translate('Please enter valid email'));
      return false;
    }
    this.isLogin = true;
    const param = {
      email: this.reset_email
    };
    this.api.post('users/sendOTP', param).then((data: any) => {
      console.log(data);
      this.isLogin = false;
      if (data && data.status === 200) {
        this.reset_id = data.data.id;
        this.isLogin = false;
        this.div_type = 2;
      } else {
        if (data && data.status === 500 && data.data && data.data.message) {
          this.util.errorMessage(data.data.message);
          return false;
        }
        this.util.errorMessage(this.util.translate('Something went wrong'));
        return false;
      }
    }, error => {
      console.log(error);
      this.isLogin = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  verifyOTPOfReset() {
    if (!this.reset_otp || this.reset_otp === '') {
      this.util.errorMessage(this.util.translate('otp is required'));
      return false;
    }
    this.isLogin = true;
    const param = {
      id: this.reset_id,
      otp: this.reset_otp
    };
    this.api.post('users/verifyOTP', param).then((data: any) => {
      console.log(data);
      this.isLogin = false;
      if (data && data.status === 200) {
        this.isLogin = false;
        this.div_type = 3;
      } else {
        if (data && data.status === 500 && data.data && data.data.message) {
          this.util.errorMessage(data.data.message);
          return false;
        }
        this.util.errorMessage(this.util.translate('Something went wrong'));
        return false;
      }
    }, error => {
      console.log(error);
      this.isLogin = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  sendEmailResetPasswordMail() {
    if (!this.reset_password || !this.reset_repass || this.reset_password === '' || this.reset_repass === '') {
      this.util.errorMessage(this.util.translate('All Field are required'));
      return false;
    }
    const param = {
      email: this.reset_email,
      pwd: this.reset_password
    };
    this.isLogin = true;
    this.api.post('users/update_password', param).then((data: any) => {
      console.log(data);
      this.isLogin = false;
      if (data && data.status === 200) {
        this.isLogin = false;
        this.util.suucessMessage(this.util.translate('Password Updated'));
        this.forgotPwd.hide();
      } else {
        if (data && data.status === 500 && data.data && data.data.message) {
          this.util.errorMessage(data.data.message);
          return false;
        }
        this.util.errorMessage(this.util.translate('Something went wrong'));
        return false;
      }
    }, error => {
      console.log(error);
      this.isLogin = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  sendOTPOnMobile() {
    const param = {
      phone: this.reset_phone
    };
    this.isLogin = true;
    this.api.post('users/validatePhoneForReset', param).then((data: any) => {
      this.isLogin = false;
      console.log('data', data);
      if (data && data.status === 200) {
        console.log('all done...');
        console.log('+', this.reset_cc, this.reset_phone);
        this.sendOTPForReset();
        this.div_type = 2;
      } else if (data && data.status === 500) {
        this.util.errorMessage(data.data.message);
      } else {
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.isLogin = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.isLogin = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  sendOTPForReset() {
    const message = this.util.translate('Your S2ftech app verification code : ');
    const param = {
      msg: message,
      to: '+' + this.reset_cc + this.reset_phone
    };
    console.log(param);
    this.util.start();
    this.api.post('users/twilloMessage', param).then((data: any) => {
      console.log(data);
      this.reset_id = data.data.id;
      this.util.stop();
    }, error => {
      console.log(error);
      this.util.stop();
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  verifyResetCode() {
    console.log(this.reset_otp);
    if (this.reset_otp === '' || !this.reset_otp) {
      this.util.errorMessage(this.util.translate('Not valid code'));
      return false;
    }
    if (this.reset_otp) {
      const param = {
        id: this.reset_id,
        otp: this.reset_otp
      };
      this.isLogin = true;
      this.api.post('users/verifyOTP', param).then((data: any) => {
        console.log(data);
        this.isLogin = false;
        if (data && data.status === 200) {
          this.div_type = 3;
          // this.modalCtrl.dismiss('', 'ok');
        } else {
          if (data && data.status === 500 && data.data && data.data.message) {
            this.util.errorMessage(data.data.message);
            return false;
          }
          this.util.errorMessage(this.util.translate('Something went wrong'));
          return false;
        }
      }, error => {
        this.isLogin = false;
        console.log(error);
        this.util.errorMessage(this.util.translate('Something went wrong'));
      });
    } else {
      this.util.errorMessage(this.util.translate('Not valid code'));
      return false;
    }
  }

  resetPasswordWithPhone() {
    console.log('pwddd0<<<<<<', this.reset_password);
    if (!this.reset_password || !this.reset_repass || this.reset_password === '' || this.reset_repass === '') {
      this.util.errorMessage(this.util.translate('All Field are required'));
      return false;
    }
    const param = {
      phone: this.reset_phone,
      pwd: this.reset_password
    };
    this.isLogin = true;
    this.api.post('users/resetPasswordWithPhone', param).then((data: any) => {
      console.log(data);
      this.isLogin = false;
      if (data && data.status === 200) {
        this.isLogin = false;
        this.util.suucessMessage(this.util.translate('Password Updated'));
        this.forgotPwd.hide();
      } else {
        if (data && data.status === 500 && data.data && data.data.message) {
          this.util.errorMessage(data.data.message);
          return false;
        }
        this.util.errorMessage(this.util.translate('Something went wrong'));
        return false;
      }
    }, error => {
      console.log(error);
      this.isLogin = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }
  // reset password




  onPage(item) {
    console.log(item);
    this.sideMenu.hide();
    this.router.navigate([item]);
  }

  onProfile(item) {
    this.sideMenu.hide();
    if (this.util && this.util.userInfo && this.util.userInfo.first_name) {
      const name = (this.util.userInfo.first_name + '-' + this.util.userInfo.last_name).toLowerCase();
      this.router.navigate(['user', name, item]);
    } else {
      this.loginModal.show();
    }
  }

  changeLanguage(value) {
    const item = this.util.languages.filter(x => x.file === value.file);
    if (item && item.length > 0) {
      localStorage.setItem('language', value.file);
      window.location.reload();
    }
  }

  haveSigned() {
    const uid = localStorage.getItem('uid');
    if (uid && uid != null && uid !== 'null') {
      return true;
    }
    return false;
  }

  logout() {
    this.sideMenu.hide();
    localStorage.removeItem('uid');
    this.router.navigate(['']);
  }


  closeModal() {
    clearInterval(this.interval);
    this.basicModal.hide();
  }

  sendMessage() {
    // store to opponent
    console.log(this.msg);
    if (!this.msg || this.msg === '') {
      return false;
    }
    const msg = this.msg;
    this.msg = '';
    const param = {
      room_id: this.id_chat,
      uid: this.id_chat + '_' + this.uid_chat,
      from_id: this.uid_chat,
      message: msg,
      message_type: 'users',
      status: 1,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
    };
    // this.myContent.scrollToBottom(300);
    this.yourMessage = false;
    this.api.post('chats/save', param).then((data: any) => {
      console.log(data);
      if (data && data.status === 200) {
        this.getInbox();
      } else {
        this.yourMessage = true;
      }
    }, error => {
      console.log(error);
      this.yourMessage = true;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  getInbox() {
    const param = {
      id: this.id_chat + '_' + this.uid_chat,
      oid: this.id_chat
    };
    this.api.post('chats/getById', param).then((data: any) => {
      console.log(data);
      this.loaded_chat = true;
      this.yourMessage = true;
      if (data && data.status === 200) {
        this.messages = data.data;
        this.scrollToBottom();
      }
    }, error => {
      console.log(error);
      this.loaded_chat = true;
      this.yourMessage = true;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  scrollToBottom() {
    console.log(this.scrollMe.nativeElement.scrollTop);
    this.scrollMe.nativeElement.scrollTop = this.scrollMe.nativeElement.scrollHeight;
    console.log(this.scrollMe.nativeElement.scrollTop);
    // try {

    // } catch (err) { }
  }

}
