
import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { Router, NavigationExtras } from "@angular/router";
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import { CartService } from 'src/app/services/cart.service';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  seg_id = 1;
  name: any;
  photo: any = 'assets/imgs/user.png';
  email: any;
  id: any;
  userDetail;
  constructor(
    public api: ApisService,
    private router: Router,
    public util: UtilService,
    private navCtrl: NavController,
    private cart: CartService
  ) {

  }

  ngOnInit() {
  }

  goToAddress() {
    const navData: NavigationExtras = {
      queryParams: {
        from: 'accont'
      }
    };
    this.router.navigate(['/choose-address'], navData);
  }

  changeSegment(val) {
    this.seg_id = val;
  }

  goToselectRestaurants() {
    this.router.navigate(['/choose-restaurant']);
  }

  editProfile() {
    this.router.navigate(['/edit-profile']);
  }

  getProfile() {
    return this.util.userInfo && this.util.userInfo.cover ? this.api.mediaURL + this.util.userInfo.cover : 'assets/user.png';
  }

  getName() {
    return this.util.userInfo && this.util.userInfo.first_name ?
      this.util.userInfo.first_name + ' ' + this.util.userInfo.last_name : 'S2ftech';
  }
  getEmail() {
    return this.util.userInfo && this.util.userInfo.email ? this.util.userInfo.email : 'info@S2ftech.com';
  }

  // orders() {
  //   this.navCtrl.navigateRoot(['tabs/tab2']);
  // }

  reset() {
    this.router.navigate(['forgot']);
  }

  goToAbout() {
    this.navCtrl.navigateRoot(['tabs/tab5/about']);
  }

  goToContact() {
    this.navCtrl.navigateRoot(['tabs/tab5/contacts']);
  }

  goLangs() {
    this.navCtrl.navigateRoot(['tabs/tab5/languages']);
  }

  goToChats() {
    this.router.navigate(['chats']);
  }

  goFaqs() {
    this.navCtrl.navigateRoot(['tabs/tab5/faqs']);
  }

  goHelp() {
    this.navCtrl.navigateRoot(['tabs/tab5/help']);
  }

  logout() {
    localStorage.removeItem('uid');
    this.cart.cart = [];
    this.cart.itemId = [];
    this.cart.totalPrice = 0;
    this.cart.grandTotal = 0;
    this.cart.coupon = null;
    this.cart.discount = null;
    this.util.clearKeys('cart');
    this.navCtrl.navigateRoot(['']);
  }

  reviews() {
    console.log('review');
    this.router.navigate(['choose-restaurant']);
  }
}
