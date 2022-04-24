
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { Location } from '@angular/common';
import { CartService } from 'src/app/services/cart.service';
import { ModalDirective } from 'angular-bootstrap-md';
import { register } from 'src/app/interfaces/register';
import { mobileLogin } from 'src/app/interfaces/mobileLogin';
import { mobile } from 'src/app/interfaces/mobile';
import { login } from 'src/app/interfaces/login';
import * as moment from 'moment';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-food',
  templateUrl: './all-food.component.html',
  styleUrls: ['./all-food.component.scss']
})
export class AllFoodComponent implements OnInit {
  @ViewChild('variantModal') public variantModal: ModalDirective;
  @ViewChild('verifyModal') public verifyModal: ModalDirective;
  @ViewChild('registerModal') public registerModal: ModalDirective;
  @ViewChild('loginModal') public loginModal: ModalDirective;
  @ViewChild('otpModal') public otpModal: ModalDirective;
  @ViewChild('forgotPwd') public forgotPwd: ModalDirective;

  tab: any = 1;
  id: any;
  name: any;
  descritions: any;
  cover: any = '';
  address: any;
  Rating: any;
  time: any;
  totalRating: any;
  dishPrice: any;
  cusine: any[] = [];
  foods: any[] = [];
  dummyFoods: any[] = [];
  categories: any[] = [];
  dummy = Array(5);
  dumyCates: any[] = Array(10);
  veg: boolean;
  deliveryAddress: any = '';

  restDetail;
  caetId: any;

  productName: any = '';
  desc: any = '';
  total: any = 0;
  lists: any;
  carts: any[] = [];
  userCart: any[] = [];

  sameProduct: boolean = false;
  removeProduct: boolean = false;

  radioSelected: any;
  haveSize: boolean;


  newItem: boolean = false;

  sameCart: any[] = [];
  images: any[] = [];
  variantIndex: any = '';

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
  activeTab = 'home';
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
  open: any;
  close: any;
  contactNo: any;

  reviews: any[] = [];

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

  haveData: boolean;
  haveReview: boolean;
  havePhotos: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public api: ApiService,
    public util: UtilService,
    private navCtrl: Location,
    public cart: CartService,
    private chMod: ChangeDetectorRef) {
    this.resendCode = false;
    this.div_type = 1;
    this.haveData = true;
    this.haveReview = true;
    this.havePhotos = true;
    console.log('-/', this.route.snapshot.paramMap.get('id'))
    if (this.route.snapshot.paramMap.get('id')) {
      this.id = this.route.snapshot.paramMap.get('id');
      this.getVenueDetails();
    }
  }

  getVenueDetails() {

    const body = {
      id: this.id
    };

    this.api.post('stores/getByUid', body).then((datas: any) => {
      console.log(datas);
      if (datas && datas.status === 200 && datas.data.length > 0) {
        const data = datas.data[0];
        if (data) {
          this.cart.cartStoreInfo = data;
          this.name = data.name;
          this.descritions = data.descriptions;
          this.cover = data.cover;
          this.address = data.address;
          this.Rating = data.rating ? data.rating : 0;
          this.totalRating = data.total_rating ? data.total_rating : 0;
          this.dishPrice = data.dish;
          this.contactNo = data.mobile;
          this.images = JSON.parse(data.images);
          if (this.images.length <= 0) {
            this.havePhotos = false;
          }
          this.time = data.time;
          this.open = moment('10-10-2020 ' + data.open_time).format('LT');
          this.close = moment('10-10-2020 ' + data.close_time).format('LT');
          if (data.cusine && data.cusine !== '') {
            this.cusine = JSON.parse(data.cusine);
          } else {
            this.cusine = [];
          }
          this.chMod.detectChanges();
          this.getCates();
          this.getReviews();
        } else {
          this.util.errorMessage(this.util.translate('Restaurant not found'));
          this.navCtrl.back();
        }
      } else {
        this.dummy = [];
      }
    }, error => {
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  getCates() {
    const param = {
      id: this.id
    };
    this.dumyCates = Array(10);
    this.api.post('categories/getByRestId', param).then((data: any) => {
      console.log('all categogies', data);

      if (data && data.status === 200 && data.data.length) {
        data.data = data.data.filter(x => x.status === '1');
        this.categories = data.data;
        this.caetId = this.categories[0].id;
        this.getFoodByCid();
        this.dumyCates = [];
      } else {
        this.dumyCates = [];
        this.dummy = [];
        this.haveData = false;
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.dumyCates = [];
      this.haveData = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.dumyCates = [];
      this.haveData = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  getFoodByCid() {
    const param = {
      id: this.id,
      cid: this.caetId
    };
    this.dummy = Array(5);
    this.foods = [];
    this.haveData = true;
    this.api.post('products/getFoodByCid', param).then((data: any) => {
      this.dummy = [];
      console.log(data);
      console.log(data && data.status === 200 && data.data.length > 0);
      if (data && data.status === 200 && data.data.length > 0) {
        data.data = data.data.filter(x => x.status === '1');
        data.data.forEach(element => {
          if (element.variations && element.variations !== '' && typeof element.variations === 'string') {
            element.variations = JSON.parse(element.variations);
          } else {
            element.variations = [];
          }
          if (this.cart.itemId.includes(element.id)) {
            const index = this.cart.cart.filter(x => x.id === element.id);
            console.log('->index->', index);
            if (index && index.length) {
              element['quantiy'] = index[0].quantiy;
              element['selectedItem'] = index[0].selectedItem;
            } else {
              element['quantiy'] = 0;
              element['selectedItem'] = [];
            }
          } else {
            element['quantiy'] = 0;
            element['selectedItem'] = [];
          }
        });
        this.foods = data.data;
        this.dummyFoods = data.data;
        this.chMod.detectChanges();
        console.log('foodds--->>', this.foods);
      } else {
        this.haveData = false;
      }
    }, error => {
      console.log(error);
      this.haveData = false;
      this.dummy = [];
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.haveData = false;
      this.dummy = [];
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  ngOnInit(): void { }

  goToFoodDetail() {
    this.router.navigate(['/food-detail']);
  }

  getReviews() {
    const param = {
      id: this.id,
      where: 'sid = ' + this.id
    };
    this.api.post('rating/getFromIDs', param).then((data: any) => {
      console.log(data);
      if (data && data.status === 200) {
        this.reviews = data.data;
      } else {
        this.haveReview = false;
      }
    }, error => {
      console.log(error);
      this.haveReview = false;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  getDate(date) {
    return moment(date).format('lll');
  }

  goToPayment() {
    this.router.navigate(['/payment']);
  }

  add(index) {
    const uid = localStorage.getItem('uid');
    console.log('uid', localStorage.getItem('uid'));
    if (uid && uid != null && uid !== 'null') {
      if (this.cart.cart.length === 0) {
        console.log('cart is empty');
        if (this.foods[index].variations && this.foods[index].variations.length) {
          console.log('open modal');
          this.openVariations(index);
        } else {
          this.foods[index].quantiy = 1;
          this.cart.addItem(this.foods[index]);
        }
      } else {
        console.log('cart is full');
        const restIds = this.cart.cart.filter(x => x.restId === this.id);
        console.log(restIds);
        if (restIds && restIds.length > 0) {
          if (this.foods[index].variations && this.foods[index].variations.length) {
            console.log('open modal');
            this.openVariations(index);
          } else {
            this.foods[index].quantiy = 1;
            this.cart.addItem(this.foods[index]);
          }
        } else {
          this.dummy = [];
          this.presentAlertConfirm();
        }
      }
      this.chMod.detectChanges();
    } else {
      // this.router.navigate(['/login']);
      this.loginModal.show();
    }
  }

  async presentAlertConfirm() {
    console.log('present alert to clear');
    Swal.fire({
      title: this.util.translate('Warning'),
      text: this.util.translate(`you already have item's in cart with different restaurant`),
      icon: 'error',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: this.util.translate('Clear cart'),
      backdrop: false,
      background: 'white'
    }).then(status => {
      if (status && status.value) {
        console.log('clear');
        this.cart.clearCart();
      }
    });

  }

  getQuanity(id) {
    const data = this.cart.cart.filter(x => x.id === id);
    return data[0].quantiy;
  }

  addQ(index) {
    console.log('foooduieeeee===========>>', this.foods[index]);
    if (this.foods[index].variations && this.foods[index].variations.length) {
      this.openVariations(index);
    } else {
      this.foods[index].quantiy = this.foods[index].quantiy + 1;
      this.cart.addQuantity(this.foods[index].quantiy, this.foods[index].id);
      this.chMod.detectChanges();
    }
  }

  removeQ(index) {
    if (index < 0) {
      console.log('negative items');
      this.cart.cart = [];
      localStorage.removeItem('userCart');
      window.location.reload();
    }
    if (this.foods[index].quantiy !== 0) {
      if (this.foods[index].quantiy >= 1 && !this.foods[index].variations.length) {
        this.foods[index].quantiy = this.foods[index].quantiy - 1;
        if (this.foods[index].quantiy === 0) {
          this.foods[index].quantiy = 0;
          this.cart.removeItem(this.foods[index].id);
        } else {
          this.cart.addQuantity(this.foods[index].quantiy, this.foods[index].id);
        }
        this.chMod.detectChanges();
      } else {
        this.openVariations(index);
      }
    } else {
      this.foods[index].quantiy = 0;
      this.cart.removeItem(this.foods[index].id);
      this.chMod.detectChanges();
    }
  }
  async openVariations(index) {
    console.log('open variantions///', this.foods[index]);
    this.variantIndex = null;
    this.lists = [];
    this.productName = '';
    this.haveSize = false;
    this.sameProduct = false;
    this.sameCart = [];
    this.userCart = [];
    ////
    this.carts = [];
    this.variantIndex = index;
    this.lists = this.foods[index].variations;
    this.productName = this.foods[index].name;
    console.log(this.productName, this.foods[index]);
    const userCart = localStorage.getItem('userCart');
    this.haveSize = this.foods[index].size === '1';
    console.log('usercart---->', userCart);
    if (userCart && userCart !== 'null' && userCart !== undefined && userCart !== 'undefined') {
      this.userCart = JSON.parse(userCart);
      console.log('===>>', this.userCart);
      const sameItem = this.userCart.filter(x => x.id === this.foods[index].id);
      console.log('sameItem', sameItem);
      if (sameItem.length > 0) {
        this.sameProduct = true;
        this.sameCart = sameItem[0].selectedItem;
        console.log('=??==>asdasd-->>>asd>>>>', this.sameCart);
      }
    } else {
      this.userCart = [];
    }
    console.log(this.sameProduct);
    this.variantModal.show();
  }

  removeCartQ(i) {
    const index = this.foods.findIndex(x => x.id === this.cart.cart[i].id);
    console.log(index);
    if (index < 0) {
      console.log('negative items');
      this.cart.cart = [];
      localStorage.removeItem('userCart');
      window.location.reload();
    }
    if (this.foods[index].quantiy !== 0) {
      if (this.foods[index].quantiy >= 1 && !this.foods[index].variations.length) {
        this.foods[index].quantiy = this.foods[index].quantiy - 1;
        if (this.foods[index].quantiy === 0) {
          this.foods[index].quantiy = 0;
          this.cart.removeItem(this.foods[index].id);
        } else {
          this.cart.addQuantity(this.foods[index].quantiy, this.foods[index].id);
        }
        this.chMod.detectChanges();
      } else {
        this.openVariations(index);
      }
    } else {
      this.foods[index].quantiy = 0;
      this.cart.removeItem(this.foods[index].id);
      this.chMod.detectChanges();
    }
  }

  addCartQ(i) {
    const index = this.foods.findIndex(x => x.id === this.cart.cart[i].id);
    console.log(index);
    console.log('foooduieeeee===========>>', this.foods[index]);
    if (this.foods[index].variations && this.foods[index].variations.length) {
      this.openVariations(index);
    } else {
      this.foods[index].quantiy = this.foods[index].quantiy + 1;
      this.cart.addQuantity(this.foods[index].quantiy, this.foods[index].id);
      this.chMod.detectChanges();
    }
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
    this.cart.calcuate();
  }

  addAddonCartQ(i, j) {
    console.log(this.cart.cart[i].selectedItem[j]);
    this.cart.cart[i].selectedItem[j].total = this.cart.cart[i].selectedItem[j].total + 1;
    this.cart.calcuate();
  }


  radioGroupChange(event, title) {
    console.log(this.lists);
    console.log(event, title);
    const radioList = this.lists.filter(x => x.title === title);
    console.log(radioList);
    console.log(radioList[0].items[event.target.value].title);
    // const selectedItems = radioList[0].items[event.target.value];
    console.log('selected item', radioList[0].items[event.target.value]);
    const price = parseFloat(radioList[0].items[event.target.value].price);
    const param = {
      type: title,
      value: price,
      name: radioList[0].items[event.target.value].title
    };
    const item = this.carts.filter(x => x.type === title);
    if (item && item.length) {
      const index = this.carts.findIndex(x => x.type === title);
      this.carts[index].value = price;
      this.carts[index].name = radioList[0].items[event.target.value].title;
    } else {
      this.carts.push(param);
    }
    console.log('cart', this.carts);
  }

  addToCart() {
    /*
      new
      sameChoice
      newCustom
      remove
    */

    const addedSize = this.carts.filter(x => x.type === 'size');
    console.log(addedSize);
    let role;
    if (this.haveSize && !addedSize.length) {
      console.log('no size added');
      this.util.errorMessage(this.util.translate('Please select size'));
      return false;
    }
    if (this.carts.length && !this.userCart.length) {
      role = 'new';
    }
    if (this.carts.length && this.userCart.length) {
      role = 'new';
    }
    if (!this.carts.length) {
      role = 'dismissed';
    }
    if (this.newItem) {
      role = 'newCustom';
    }
    console.log('role', role, this.carts);

    if (this.haveSize === false) {
      const regularItem =
      {
        name: 'Regular',
        type: 'size',
        value: Number(this.foods[this.variantIndex].price)
      };
      this.carts.push(regularItem);
    }

    if (role === 'new') {
      this.foods[this.variantIndex].quantiy = 1;
      const carts = {
        item: this.carts,
        total: 1
      };
      this.foods[this.variantIndex].selectedItem.push(carts);
      console.log('id===>?>>', this.foods[this.variantIndex].id);
      this.cart.addVariations(this.foods[this.variantIndex], carts, role);
      this.cart.calcuate();
    }
    if (role === 'newCustom') {
      const carts = {
        item: this.carts,
        total: 1
      };
      this.foods[this.variantIndex].selectedItem.push(carts);
      this.foods[this.variantIndex].quantiy = this.foods[this.variantIndex].quantiy + 1;
      this.cart.addVariations(this.foods[this.variantIndex], carts, 'newCustom');
      this.cart.calcuate();
    }
    if (role === 'dismissed') {
      this.foods[this.variantIndex].quantiy = 1;
      const carts = {
        item: this.carts,
        total: 1
      };
      this.foods[this.variantIndex].selectedItem.push(carts);
      console.log('id===>?>>', this.foods[this.variantIndex].id);
      this.cart.addVariations(this.foods[this.variantIndex], carts, 'new');

      // console.log('none choice');
      // this.foods[this.variantIndex].quantiy = this.foods[this.variantIndex].quantiy + 1;
      // this.cart.addQuantity(this.foods[this.variantIndex].quantiy, this.foods[this.variantIndex].id);
      // this.chMod.detectChanges();
    }
    this.variantModal.hide();
  }

  checkedEvent(event, title) {
    console.log(event, title);
    const price = parseFloat(event.target.value);
    const param = {
      type: title,
      value: price,
      name: title
    };
    if (event.target && event.target.checked) {
      this.carts.push(param);
    } else {
      this.carts = this.carts.filter(x => x.type !== title);
    }
    console.log(this.carts);
  }


  sameChoise() {
    console.log(this.sameCart);
    this.foods[this.variantIndex].selectedItem = this.sameCart;
    this.foods[this.variantIndex].quantiy = this.foods[this.variantIndex].selectedItem.length;
    if (this.foods[this.variantIndex].quantiy === 0) {
      this.foods[this.variantIndex].quantiy = 0;
      this.cart.removeItem(this.foods[this.variantIndex].id);
    } else {
      this.cart.addVariations(this.foods[this.variantIndex], 'carts', 'sameChoice');
      this.cart.calcuate();
    }
    this.variantModal.hide();
  }

  removeQSame(index) {
    this.sameCart[index].total = this.sameCart[index].total - 1;
    if (this.sameCart[index].total === 0) {
      this.sameCart = this.sameCart.filter(x => x.total !== 0);
    }
    console.log(this.sameCart.length);
    if (this.sameCart.length <= 0) {
      this.foods[this.variantIndex].quantiy = 0;
      this.foods[this.variantIndex].selectedItem = [];
      this.cart.removeItem(this.foods[this.variantIndex].id);
      this.sameProduct = false;
      this.cart.calcuate();
      this.variantModal.hide();
    }
  }

  addQSame(index) {
    this.sameCart[index].total = this.sameCart[index].total + 1;
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
      this.util.start();

      this.api.post('users/login', this.login).then((data: any) => {
        this.util.stop();
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
                  const inboxParam: NavigationExtras = {
                    queryParams: {
                      id: 0,
                      name: 'Support',
                      uid: data.data.id
                    }
                  };
                  this.router.navigate(['inbox'], inboxParam);
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
        console.log(error);
        this.util.stop();
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
      this.util.start();
      this.api.post('users/loginWithPhoneAndPassword', param).then((data) => {
        this.util.stop();
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
                  // localStorage.setItem('helpId', data.data.id);
                  // this.router.navigate(['inbox']);
                  const inboxParam: NavigationExtras = {
                    queryParams: {
                      id: 0,
                      name: 'Support',
                      uid: data.data.id
                    }
                  };
                  this.router.navigate(['inbox'], inboxParam);
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
        this.util.stop();
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.util.stop();
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
      this.util.start();
      this.api.post('users/verifyOTP', param).then((data: any) => {
        console.log(data);
        this.util.stop();
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
                      const inboxParam: NavigationExtras = {
                        queryParams: {
                          id: 0,
                          name: 'Support',
                          uid: this.uid
                        }
                      };
                      this.router.navigate(['inbox'], inboxParam);
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
        this.util.stop();
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
      this.util.start();
      this.api.post('users/checkMobileNumber', param).then((data) => {
        this.util.stop();
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
        this.util.stop();
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.util.stop();
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
      this.util.start();
      this.api.post('users/verifyOTP', param).then((data: any) => {
        console.log(data);
        this.util.stop();
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
        this.util.stop();
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
        this.util.start();
        this.api.post('users/validatePhoneAndEmail', param).then((data: any) => {
          this.util.stop();
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
          this.util.stop();
          this.util.errorMessage(this.util.translate('Something went wrong'));
        }).catch(error => {
          console.log(error);
          this.util.stop();
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
        this.util.start();
        this.api.post('users/registerUser', param).then((data: any) => {
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
            registerModal.hide();
            this.sendVerification(this.login.email, this.api.baseUrl + 'users/verify?uid=' + data.data.id);

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

  openCart() {
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

      return false;
    }
    this.router.navigate(['cart']);
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
}
