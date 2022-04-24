
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CartService } from 'src/app/services/cart.service';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  name: any;
  descritions: any;
  cover: any;
  address: any;
  time: any;
  totalRatting: any = 0;
  coupon: any;
  dates: any;
  times: any;
  haveItems: any =0;
  constructor(
    public api: ApisService,
    private router: Router,
    private route: ActivatedRoute,
    public util: UtilService,
    private navCtrl: NavController,
    private chMod: ChangeDetectorRef,
    public cart: CartService
  ) {
    this.util.getCouponObservable().subscribe(data => {
      if (data) {
        console.log('------------->>', data);
      }
    });
    this.cart.orderNotes = '';
    this.route.queryParams.subscribe(data => {
      this.dates = data.date,
        this.times = data.time
    });
  }

  ngOnInit() {
    this.times = localStorage.getItem('times');
    this.dates = localStorage.getItem('dates');
    this.checkDateTime();
  }
  ionViewWillEnter() {
    setTimeout(() => {
      if (this.cart.cart.length) {
        this.getVenueDetails();
      }
    }, 1500);

  }


  validate() {
  }

  getVenueDetails() {
    const body = {
      id: this.cart.cart[0].restId
    };
    this.api.post('stores/getByUid', body).then((datas: any) => {
      console.log(datas);
      if (datas && datas.status === 200 && datas.data.length > 0) {
        const data = datas.data[0];
        this.cart.cartStoreInfo = data;
        this.cart.cart[0].veg;
        console.log('data-->>');
        this.name = data.name;
        this.descritions = data.descritions;
        this.cover = data.cover;
        this.address = data.address;
        this.time = data.time;
        this.totalRatting = data.totalRatting;
      }
    }, error => {
      console.log(error);
      // this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      // this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  getCart() {
    this.navCtrl.navigateRoot(['tabs/tab1']);
  }

  addQ(index) {
    console.log(this.cart.cart[index]);
    this.cart.cart[index].quantiy = this.cart.cart[index].quantiy + 1;
    this.cart.calcuate();
  }
  removeQ(index) {
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
    this.cart.calcuate();
  }



  changeAddress() {
    if (this.cart.totalPrice < this.cart.minOrderPrice) {
      let text;
      if (this.util.cside === 'left') {
        text = this.util.currecny + ' ' + this.cart.minOrderPrice;
      } else {
        text = this.cart.minOrderPrice + ' ' + this.util.currecny;
      }
      this.util.errorToast(this.util.translate('Minimum order amount must be ') + text + this.util.translate(' or more'));
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        from: 'cart'
      }
    };
    this.router.navigate(['choose-address'], navData);
  }

  checkDateTime() {
    const param = {
      id: this.dates
    }
    this.api.post('orders/getByDate', param).then((data: any) => {
      if (data.message == "Success") {
        this.haveItems = data.data.filter(x => x.time.trim() == this.times.trim());
        debugger
      }
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }
  checkout() {
    if (this.haveItems == 0) {
      if (this.cart.totalPrice < this.cart.minOrderPrice) {
        let text;
        if (this.util.cside === 'left') {
          text = this.util.currecny + ' ' + this.cart.minOrderPrice;
        } else {
          text = this.cart.minOrderPrice + ' ' + this.util.currecny;
        }
        this.util.errorToast(this.util.translate('Minimum order amount must be') + text + this.util.translate('or more'));
        return false;
      }
      const navData: NavigationExtras = {
        queryParams: {
          from: 'cart',
          date: this.dates,
          time: this.times
        }
      };
        this.router.navigate(['payments'], navData);
    }
    else{
      this.util.errorToast(this.util.translate('This time is already booked, Please choose another time'));
      this.router.navigate(['select-time']);
    }
  }
  
  checkouts(){
    if (this.cart.totalPrice < this.cart.minOrderPrice) {
      let text;
      if (this.util.cside === 'left') {
        text = this.util.currecny + ' ' + this.cart.minOrderPrice;
      } else {
        text = this.cart.minOrderPrice + ' ' + this.util.currecny;
      }
      this.util.errorToast(this.util.translate('Minimum order amount must be') + text + this.util.translate('or more'));
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        from: 'cart',
        date: this.dates,
        time: this.times
      }
    };
      this.router.navigate(['choose-address'], navData);
  }
  openCoupon() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.cart.cartStoreInfo.id,
        restId: this.cart.cart[0].restId,
        name: this.name,
        totalPrice: this.cart.totalPrice
      }
    };
    this.router.navigate(['coupons'], navData);
  }

  removeQAddos(i, j) {
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

  addQAddos(i, j) {
    console.log(this.cart.cart[i].selectedItem[j]);
    this.cart.cart[i].selectedItem[j].total = this.cart.cart[i].selectedItem[j].total + 1;
    this.cart.calcuate();
  }
}
