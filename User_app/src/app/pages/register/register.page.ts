
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { ApisService } from 'src/app/services/apis.service';
import { register } from 'src/app/interfaces/register';
import { AlertController, MenuController, ModalController, NavController } from '@ionic/angular';
import { VerifyPage } from '../verify/verify.page';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import * as moment from 'moment';
import { SelectCountryPage } from '../select-country/select-country.page';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  login: register = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    gender: '1',
    mobile: '',
    fcm_token: '',
    type: '',
    lat: '',
    lng: '',
    cover: '',
    status: '',
    verified: '',
    others: '',
    date: '',
    stripe_key: '',
    cc: '',
    check: false
  };
  submitted = false;
  isLogin: boolean = false;
  check: boolean;
  ccCode: any = '+91';

  constructor(
    private router: Router,
    public api: ApisService,
    public util: UtilService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private iab: InAppBrowser,
    private menuController: MenuController,
    private alertController: AlertController
  ) {
    this.login.cc = '+91';
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: VerifyPage,
      componentProps: { code: this.ccCode, phone: this.login.mobile }
    });

    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.role === 'ok') {
        console.log('login');
        const param = {
          first_name: this.login.first_name,
          last_name: this.login.last_name,
          email: this.login.email,
          password: this.login.password,
          gender: this.login.gender,
          fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : 'NA',
          type: 'user',
          lat: '',
          lng: '',
          cover: 'NA',
          mobile: this.login.mobile,
          status: 1,
          country_code: this.ccCode,
          verified: 0,
          others: 1,
          date: moment().format('YYYY-MM-DD'),
          stripe_key: ''
        };

        console.log('param', param);
        this.isLogin = true;
        this.api.post('users/registerUser', param).then((data: any) => {
          this.isLogin = false;
          console.log(data);
          if (data && data.status === 200) {
            this.util.userInfo = data.data;
            localStorage.setItem('uid', data.data.id);
            const fcm = localStorage.getItem('fcm');
            if (fcm && fcm !== null && fcm !== 'null') {
              const updateParam = {
                id: data.data.id,
                fcm_token: fcm
              };
              this.api.post('users/edit_profile', updateParam).then((data: any) => {
                console.log('user info=>', data);
              }, error => {
                console.log(error);
              });
            }
            this.sendVerification(this.login.email, this.api.baseUrl + 'users/verify?uid=' + data.data.id);
            this.navCtrl.navigateRoot(['']);

          } else if (data && data.status === 500) {
            this.util.errorToast(data.data.message);
          } else {
            this.util.errorToast(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.isLogin = false;
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
      }
    });
    modal.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirm Informations',
      message: 'We will send verification code to your mobile number  ' + this.ccCode + this.login.mobile,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Send',
          handler: () => {
            console.log('Confirm Okay');
            this.openModal();
          }
        }
      ]
    });

    await alert.present();
  }
  ngOnInit() {
  }
  onLogin(form: NgForm) {
    console.log('form', this.login, this.ccCode);
    console.log(this.util.twillo);
    this.submitted = true;
    console.log(this.login.check);
    if (form.valid) {
      if (!this.login.check) {
        this.util.showToast(this.util.translate('Please accept terms and conditions'), 'dark', 'bottom');
        return false;
      }
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
        return false;
      }
      if (this.util.twillo === '1') {
        console.log('open model=>>>');
        const param = {
          email: this.login.email,
          phone: this.login.mobile
        };
        this.isLogin = true;
        this.api.post('users/validatePhoneAndEmail', param).then((data: any) => {
          this.isLogin = false;
          console.log('data', data);
          if (data && data.status === 200) {
            console.log('all done...');
            this.presentAlertConfirm();
          } else if (data && data.status === 500) {
            this.util.errorToast(data.data.message);
          } else {
            this.util.errorToast(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.isLogin = false;
          this.util.errorToast(this.util.translate('Something went wrong'));
        }).catch(error => {
          console.log(error);
          this.isLogin = false;
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
        // this.openModal();
      } else {
        console.log('login');
        const param = {
          first_name: this.login.first_name,
          last_name: this.login.last_name,
          email: this.login.email,
          password: this.login.password,
          gender: this.login.gender,
          fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : 'NA',
          type: 'user',
          lat: '',
          lng: '',
          cover: 'NA',
          mobile: this.login.mobile,
          status: 1,
          country_code: this.ccCode,
          verified: 0,
          others: 1,
          date: moment().format('YYYY-MM-DD'),
          stripe_key: ''
        };

        console.log('param', param);
        this.isLogin = true;
        this.api.post('users/registerUser', param).then((data: any) => {
          this.isLogin = false;
          console.log(data);
          if (data && data.status === 200) {
            this.util.userInfo = data.data;
            localStorage.setItem('uid', data.data.id);
            const fcm = localStorage.getItem('fcm');
            if (fcm && fcm !== null && fcm !== 'null') {
              const updateParam = {
                id: data.data.id,
                fcm_token: fcm
              };
              this.api.post('users/edit_profile', updateParam).then((data: any) => {
                console.log('user info=>', data);
              }, error => {
                console.log(error);
              });
            }
            this.sendVerification(this.login.email, this.api.baseUrl + 'users/verify?uid=' + data.data.id);
            this.navCtrl.navigateRoot(['']);

          } else if (data && data.status === 500) {
            this.util.errorToast(data.data.message);
          } else {
            this.util.errorToast(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.isLogin = false;
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
      }


    }
  }

  sendVerification(mail, link) {
    const param = {
      email: mail,
      url: link
    };

    this.api.post('users/sendVerificationMail', param).then((data) => {
      console.log('mail', data);
    }, error => {
      console.log(error);
    });
  }
  back() {
    this.navCtrl.back();
  }

  async openCountry() {
    console.log('open ccode');
    const modal = await this.modalCtrl.create({
      component: SelectCountryPage,
      backdropDismiss: false,
      showBackdrop: true,
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.role === 'selected') {
        console.log('ok');
        this.login.cc = '+' + data.data;
        this.ccCode = '+' + data.data;
      }
    });
    await modal.present();
  }

  open(type) {
    // if (type === 'eula') {
    //   this.iab.create('https://initappz.com/groceryeeaagya/eula.html');
    // } else {
    //   this.iab.create('https://initappz.com/groceryeeaagya/privacy.html');
    // }
  }

  ionViewWillEnter() {
    this.menuController.enable(false);
  }
  ionViewWillLeave() {
    this.menuController.enable(true);
  }
}
