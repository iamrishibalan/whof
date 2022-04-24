
import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import * as moment from 'moment';
import { ApisService } from 'src/app/services/apis.service';
@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {

  dummy: any[] = [];
  reviews: any[] = [];
  constructor(
    public api: ApisService,
    public util: UtilService,
    private navCtrl: NavController
  ) {
    this.getReviews();
  }

  ngOnInit() {
  }

  getReviews() {
    const param = {
      id: localStorage.getItem('uid'),
      where: 'sid = ' + localStorage.getItem('uid')
    };
    this.dummy = Array(10);
    this.api.post('rating/getFromIDs', param).then((data: any) => {
      this.dummy = [];
      console.log(data);
      if (data && data.status === 200) {
        this.reviews = data.data;
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  back() {
    this.navCtrl.back();
  }

  getDate(date) {
    return moment(date).format('lll');
  }
}
