
import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { ModalController, NavController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-rate',
  templateUrl: './rate.page.html',
  styleUrls: ['./rate.page.scss'],
})
export class RatePage implements OnInit {
  products: any;
  productss: any;

  constructor(
    public api: ApisService,
    public util: UtilService,
    private navCtrl: NavController,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    debugger
    console.log(this.util.orderDetails);
    if (this.util.orderDetails && this.util.orderDetails.orders) {
      this.products = JSON.parse(this.util.orderDetails.orders);
      this.productss =  this.products[0].veg;
      console.log(this.products);
    } else {
      this.util.errorToast('Something went wrong');
      this.navCtrl.back();
    }
  }

  submit() {

  }
  ngOnInit() {
  }
  onRatingChange(event) {
    console.log(event);
  }



  rateStore() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.util.orderDetails.restId,
        name: this.util.orderDetails.str_name,
        way: 'order'
      }
    };
    this.router.navigate(['/add-review'], navData);
  }

  ratDriver() {
    const param: NavigationExtras = {
      queryParams: {
        id: this.util.orderDetails.driverInfo.id,
        name: this.util.orderDetails.driverInfo.first_name + ' ' + this.util.orderDetails.driverInfo.last_name
      }
    };
    this.router.navigate(['driver-rating'], param);
  }

  async rateProduct(item) {
    const param: NavigationExtras = {
      queryParams: {
        id: item.id,
        name: item.name
      }
    };
    this.router.navigate(['product-rating'], param);
  }
}
