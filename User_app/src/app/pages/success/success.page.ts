
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
})
export class SuccessPage implements OnInit {

  constructor(
    private navCtrl: NavController
  ) {
    setTimeout(() => {
      this.navCtrl.navigateRoot(['/tabs/tab3']);
    }, 2000);
  }

  ngOnInit() {
  }

}
