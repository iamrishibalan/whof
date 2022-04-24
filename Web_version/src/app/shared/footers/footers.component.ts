
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
@Component({
  selector: 'app-footers',
  templateUrl: './footers.component.html',
  styleUrls: ['./footers.component.scss']
})
export class FootersComponent implements OnInit {

  qty = 2;
  constructor(
    private router: Router,
    public util: UtilService
  ) { }

  ngOnInit(): void {

  }

  getCopyright() {
    return moment().format('YYYY');
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToOrders() {
    this.router.navigate(['/checkout']);
  }

  goToAccount() {
    this.router.navigate(['/account']);
  }

  goToReview() {
    this.router.navigate(['/review']);
  }

  goToRestaurants(item) {

    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        val: item
      }
    }

    this.router.navigate(['/restaurants'], navData);
  }

  goToRest(item) {

    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        val: JSON.stringify(item)
      }
    }

    this.router.navigate(['/cityrest'], navData);
  }

  goToPrivacy() {
    this.router.navigate(['/privacy-policy']);
  }

  goToContact() {
    this.router.navigate(['/contact']);
  }

  goToAbout() {
    this.router.navigate(['/about']);
  }

  goToFaqs() {
    this.router.navigate(['/faq']);
  }

  goToNotice() {
    this.router.navigate(['/notice']);
  }

  goToCookies() {
    this.router.navigate(['/cookie']);
  }

  blogs() {
    this.router.navigate(['blog']);
  }

  goToHelp() {
    this.router.navigate(['/help']);
  }

  goToTracker() {
    this.router.navigate(['/tracker']);
  }


  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

}
