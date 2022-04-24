
import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import { ApisService } from 'src/app/services/apis.service';
// import { type } from 'os';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  content: any;
  loaded: boolean;
  types :any;
 
  constructor(
    public util: UtilService,
    private api: ApisService,
    private navCtrl: NavController
  ) {
    this.types = localStorage.getItem('type');
   if(this.types == 'store'){
    const param = {
      id: 1
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
    }).catch(error => {
      console.log(error);
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
   }else if(this.types == 'saloon'){
    const param = {
      id: 9
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
    }).catch(error => {
      console.log(error);
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
   }
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