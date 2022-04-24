
import { Component } from '@angular/core';
import { Platform, ActionSheetController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';
import { UtilService } from './services/util.service';
import { ApisService } from './services/apis.service';
import { CartService } from './services/cart.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages: any[] = [];
  selectedIndex: any;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private oneSignal: OneSignal,
    private actionSheetController: ActionSheetController,
    public util: UtilService,
    private navCtrl: NavController,
    public api: ApisService,
    private cart: CartService
  ) {

    this.selectedIndex = 0;

    this.initializeApp();
  }



  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#ff384c');
      this.splashScreen.hide();
      this.util.cityAddress = localStorage.getItem('address');
      this.appPages = this.util.appPages; console.log('%c Copyright and Good Faith Purchasers © 2020-present initappz. ', 'background: #222; color: #bada55');
      const lng = localStorage.getItem('language');
      if (!lng || lng === null) {
        this.api.get('users/getDefaultSettings').then((data: any) => {
          console.log('----------------- app setting', data);
          if (data && data.status === 200 && data.data) {
            const manage = data.data.manage;
            const language = data.data.lang;
            if (manage && manage.length > 0) {
              if (manage[0].app_close === 0 || manage[0].app_close === '0') {
                this.util.appClosed = true;
                this.util.appClosedMessage = manage[0].message;
              } else {
                this.util.appClosed = false;
              }
            } else {
              this.util.appClosed = false;
            }
            if (language) {
              this.util.translations = language;
              localStorage.setItem('language', data.data.file);
            }
            const settings = data.data.settings;
            if (settings && settings.length > 0) {
              const info = settings[0];
              this.util.direction = info.appDirection;
              this.util.cside = info.currencySide;
              this.util.currecny = info.currencySymbol;
              this.util.logo = info.logo;
              this.util.twillo = info.twillo;
              this.util.delivery = info.delivery;
              this.util.user_login = info.user_login;
              this.util.home_type = info.home_ui;
              this.util.reset_pwd = info.reset_pwd;
              document.documentElement.dir = this.util.direction;
            } else {
              this.util.direction = 'ltr';
              this.util.cside = 'right';
              this.util.currecny = '$';
              document.documentElement.dir = this.util.direction;
            }

            const general = data.data.general;
            console.log('generalllll============================>', general);
            if (general && general.length > 0) {
              const info = general[0];
              this.util.general = info;
              this.cart.minOrderPrice = parseFloat(info.min);
              this.cart.shipping = info.shipping;
              this.cart.shippingPrice = parseFloat(info.shippingPrice);
              this.cart.orderTax = parseFloat(info.tax);
              this.cart.flatTax = parseInt(info.tax);
              this.cart.freeShipping = parseFloat(info.free);
            }
          }
        }, error => {
          console.log('default settings', error);
        });
      } else {
        const param = {
          id: localStorage.getItem('language')
        };
        this.api.post('users/getDefaultSettingsById', param).then((data: any) => {
          console.log('----------------- app setting', data);
          if (data && data.status === 200 && data.data) {
            const manage = data.data.manage;
            const language = data.data.lang;
            if (manage && manage.length > 0) {
              if (manage[0].app_close === 0 || manage[0].app_close === '0') {
                this.util.appClosed = true;
                this.util.appClosedMessage = manage[0].message;
              } else {
                this.util.appClosed = false;
              }
            } else {
              this.util.appClosed = false;
            }
            if (language) {
              this.util.translations = language;
            }
            const settings = data.data.settings;
            if (settings && settings.length > 0) {
              const info = settings[0];
              this.util.direction = info.appDirection;
              this.util.cside = info.currencySide;
              this.util.currecny = info.currencySymbol;
              this.util.logo = info.logo;
              this.util.twillo = info.twillo;
              this.util.delivery = info.delivery;
              this.util.user_login = info.user_login;
              this.util.home_type = info.home_ui;
              this.util.reset_pwd = info.reset_pwd;
              document.documentElement.dir = this.util.direction;

            } else {
              this.util.direction = 'ltr';
              this.util.cside = 'right';
              this.util.currecny = '$';
              document.documentElement.dir = this.util.direction;
            }
            const general = data.data.general;
            console.log('generalllll============================>', general)
            if (general && general.length > 0) {
              const info = general[0];
              this.util.general = info;
              this.cart.minOrderPrice = parseFloat(info.min);
              this.cart.shipping = info.shipping;
              this.cart.shippingPrice = parseFloat(info.shippingPrice);
              this.cart.orderTax = parseFloat(info.tax);
              this.cart.flatTax = parseInt(info.tax);
              this.cart.freeShipping = parseFloat(info.free);
            }
          }
        }, error => {
          console.log('default settings by id', error);
          this.util.appClosed = false;
          this.util.direction = 'ltr';
          this.util.cside = 'right';
          this.util.currecny = '$';
          document.documentElement.dir = this.util.direction;
        });
      }
      if (this.platform.is('cordova')) {
        console.log('cordova platform');
        setTimeout(async () => {
          await this.oneSignal.startInit(environment.onesignal.appId, environment.onesignal.googleProjectNumber);
          this.oneSignal.getIds().then((data: any) => {
            console.log('iddddd', data);
            localStorage.setItem('fcm', data.userId);
            const uid = localStorage.getItem('uid');
            if (uid && uid !== null && uid !== 'null') {
              const param = {
                id: uid,
                fcm_token: data.userId
              };
              this.api.post('users/edit_profile', param).then((data: any) => {
                console.log('user info=>', data);
              }, error => {
                console.log(error);
              });
            }
          });
          this.oneSignal.enableSound(true);
          await this.oneSignal.endInit();

        }, 1000);
        this.oneSignal.inFocusDisplaying(2);
      }

      const uid = localStorage.getItem('uid');
      if (uid && uid !== null && uid !== 'null') {
        const param = {
          id: uid
        };
        this.api.post('users/getById', param).then((data: any) => {
          console.log('*******************', data);
          if (data && data.status === 200 && data.data && data.data.length && data.data[0].type === 'user') {
            this.util.userInfo = data.data[0];
          } else {
            localStorage.removeItem('uid');
          }
        }, error => {
          localStorage.removeItem('uid');
          console.log(error);
        });
      }

      this.platform.backButton.subscribe(async () => {
        console.log('asd', this.router.url, 'ad', this.router.isActive('/tabs/', true));
        if (this.router.url.includes('/tabs/') || this.router.url.includes('/login')) {
          navigator['app'].exitApp();
        }
      });
    });
  }
  logout() {
    localStorage.clear();
    this.navCtrl.navigateRoot(['/login']);
  }
}
