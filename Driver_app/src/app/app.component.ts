
import { Component } from '@angular/core';
import { Platform, ActionSheetController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ApiService } from 'src/app/services/api.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { UtilService } from './services/util.service';
import { Router } from '@angular/router';
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
    private geolocation: Geolocation,
    public api: ApiService,
    private oneSignal: OneSignal,
    private nativeAudio: NativeAudio,
    private actionSheetController: ActionSheetController,
    public util: UtilService,
    private router: Router,
    private navCtrl: NavController
  ) {
    this.selectedIndex = 0;
    this.initializeApp();
  }
  updateLocation(latitude, longitude) {
    if (localStorage.getItem('uid')) {
      const uid = localStorage.getItem('uid');
      if (uid && uid !== null && uid !== 'null') {
        const param = {
          id: uid,
          lat: latitude,
          lng: longitude
        };
        this.api.post('drivers/getById', param).then((data: any) => {
          console.log('*******************', data);
          if (data && data.status === 200 && data.data && data.data.length) {
            this.util.userInfo = data.data[0];
          }
        }, error => {
          console.log('==>>', error);
        });
      }
    }
  }
  getLocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      localStorage.setItem('lat', resp.coords.latitude.toString());
      localStorage.setItem('lng', resp.coords.longitude.toString());
      this.updateLocation(resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    const watch = this.geolocation.watchPosition();
    watch.subscribe((data: any) => {
      localStorage.setItem('lat', data.coords.latitude.toString());
      localStorage.setItem('lng', data.coords.longitude.toString());
      this.updateLocation(data.coords.latitude, data.coords.longitude);
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('New Notification'),
      mode: 'md',
      buttons: [{
        text: this.util.translate('OK'),
        icon: 'volume-mute',
        handler: () => {
          console.log('Delete clicked');
          this.nativeAudio.stop('audio').then(() => console.log('done'), () => console.log('error'));
        }
      }, {
        text: this.util.translate('Cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
          this.nativeAudio.stop('audio').then(() => console.log('done'), () => console.log('error'));
        }
      }]
    });

    await actionSheet.present();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#ffc107');
      this.splashScreen.hide();
      if (this.platform.is('cordova')) {
        console.log('platform is okk');
        setTimeout(async () => {
          await this.oneSignal.startInit(environment.onesignal.appId, environment.onesignal.googleProjectNumber);
          this.oneSignal.getIds().then((data) => {
            console.log('-----------------------------------', data);
            localStorage.setItem('fcm', data.userId);
            const uid = localStorage.getItem('uid');
            if (uid && uid !== null && uid !== 'null') {
              const param = {
                id: uid,
                fcm_token: data.userId
              };
              this.api.post('drivers/edit_profile', param).then((data: any) => {
                console.log('user info=>', data);
              }, error => {
                console.log(error);
              });
            }
          });
          this.oneSignal.enableSound(true);
          await this.oneSignal.endInit();
        }, 1000);

        this.nativeAudio.preloadSimple('audio', 'assets/alert.mp3').then((data: any) => {
          console.log('dupletx', data);
        }, error => {
          console.log(error);
        }).catch(error => {
          console.log(error);
        });
        this.oneSignal.handleNotificationReceived().subscribe(data => {
          console.log('got order', data);
          this.nativeAudio.play('audio', () => console.log('audio is done playing')).catch(error => console.log(error));
          this.nativeAudio.setVolumeForComplexAsset('audio', 1);
          this.presentActionSheet();
        });
        this.oneSignal.inFocusDisplaying(2);
      }
      this.appPages = this.util.appPages;
      const lng = localStorage.getItem('language');
      if (!lng || lng === null) {
        this.api.get('users/getDefaultSettings').then((data: any) => {
          console.log('get default settings', data);
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
              this.util.user_login = info.driver_login;
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
            }
            console.log('app is closed', this.util.appClosed);
          }

          console.log(this.util.translations);
          console.log(this.util.direction);
          console.log(this.util.cside);
          console.log(this.util.appClosed);
          console.log(this.util.appClosedMessage);
        }, error => {
          console.log('default settings', error);
        });
      } else {
        const param = {
          id: localStorage.getItem('language')
        };
        this.api.post('users/getDefaultSettingsById', param).then((data: any) => {
          console.log('get default settings by id', data);
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
            console.log('-->', settings);
            if (settings && settings.length > 0) {
              const info = settings[0];
              this.util.direction = info.appDirection;
              this.util.cside = info.currencySide;
              this.util.currecny = info.currencySymbol;
              this.util.logo = info.logo;
              this.util.twillo = info.twillo;
              this.util.delivery = info.delivery;
              this.util.user_login = info.driver_login;
              this.util.reset_pwd = info.reset_pwd;
              document.documentElement.dir = this.util.direction;
              console.log('wont');
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
            }
            console.log('app is closed', this.util.appClosed);
          }

          console.log(this.util.translations);
          console.log(this.util.direction);
          console.log(this.util.cside);
          console.log(this.util.appClosed);
          console.log(this.util.appClosedMessage);

        }, error => {
          console.log('default settings by id', error);
          this.util.appClosed = false;
          this.util.direction = 'ltr';
          this.util.cside = 'right';
          this.util.currecny = '$';
          document.documentElement.dir = this.util.direction;
        });
      }

      const uid = localStorage.getItem('uid');
      if (uid && uid !== null && uid !== 'null') {
        const param = {
          id: uid
        };
        this.api.post('drivers/getById', param).then((data: any) => {
          console.log('*******************', data);
          if (data && data.status === 200 && data.data && data.data.length) {
            this.util.userInfo = data.data[0];
          }
        }, error => {
          console.log('==>>', error);
        });
      }
      this.getLocation();
    });
  }

  logout() {
    localStorage.clear();
    this.navCtrl.navigateRoot(['/login']);
  }
}
