
import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.page.html',
  styleUrls: ['./faqs.page.scss'],
})
export class FaqsPage implements OnInit {
  content: any;
  loaded: boolean;
  constructor(
    public util: UtilService,
    private api: ApiService,
    private navCtrl: NavController
  ) {
    const param = {
      id: 5
    };
    this.loaded = false;
    this.api.post('pages/getById', param).then((data: any) => {
      console.log(data);
      this.loaded = true;
      if (data && data.status === 200 && data.data.length > 0) {
        const info = data.data[0];
        this.content = info.content;
      }
    }, error => {
      console.log(error);
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  ngOnInit() {
  }

  getContent() {
    return this.content;
  }

  back() {
    this.navCtrl.back();
  }

  openMenu() {
    this.util.openMenu();
  }
}
