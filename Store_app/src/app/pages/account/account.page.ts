
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  name: any = '';
  images: any[] = [];
  cover: any = '';
  address: any = '';
  open: any = '';
  close: any = '';
  Storedetails: boolean;
  saloondetail: boolean;

  constructor(
    private router: Router,
    public api: ApisService,
    private navCtrl: NavController,
    public util: UtilService
  ) {
    this.getProfile();
    this.util.obserProfile().subscribe(data => {
      this.getProfile();
    });
  }

  getProfile() {
    if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(this.util.store.images)) {
      this.images = JSON.parse(this.util.store.images);
    }
  }

  ngOnInit() {
    this.getReviews();
    let val = localStorage.getItem('type');
    if (val == 'store') {
      this.Storedetails = true;
      this.saloondetail = false;
    }
    else if (val == 'saloon') {
      this.Storedetails = false;
      this.saloondetail = true;
    }
  }


  ionViewWillEnter() {

    this.getProfile();
  }

  getReviews() {

  }

  goToAddCategoty() {
    this.router.navigate(['/category']);
  }

  goToEditProfile() {
    this.router.navigate(['/edit-profile']);
  }

  // goToOrder() {
  //   this.router.navigate(['/orders']);
  // }

  AddService(){
    this.router.navigate(['/saloonservices']);
  }
  AddFoods() {
    this.router.navigate(['/foods']);
  }
  venueDetails() {
    this.router.navigate(['venue-profile']);
  }

  // orders() {
  //   this.navCtrl.navigateRoot(['tabs/tab1']);
  // }

  reset() {
    this.router.navigate(['reset']);
  }

  goToAbout() {
    this.navCtrl.navigateRoot(['tabs/tab3/about']);
  }

  goToContact() {
    this.navCtrl.navigateRoot(['tabs/tab3/contacts']);
  }

  goLangs() {
    this.navCtrl.navigateRoot(['tabs/tab3/languages']);
  }

  goToChats() {
    this.router.navigate(['chats']);
  }

  goFaqs() {
    this.navCtrl.navigateRoot(['tabs/tab3/faqs']);
  }

  goHelp() {
    this.navCtrl.navigateRoot(['tabs/tab3/help']);
  }

  logout() {
    localStorage.removeItem('uid');
    this.navCtrl.navigateRoot(['']);
  }

  reviews() {
    this.navCtrl.navigateRoot(['tabs/tab3/review']);
  }
}
