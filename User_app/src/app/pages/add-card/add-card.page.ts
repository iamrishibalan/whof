
import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApisService } from 'src/app/services/apis.service';
import { NavController } from '@ionic/angular';
import * as moment from 'moment';
@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
})
export class AddCardPage implements OnInit {
  cnumber: any = '';
  cname: any = '';
  cvc: any = '';
  date: any = '';
  email: any = '';
  constructor(
    private navCtrl: NavController,
    public util: UtilService,
    public api: ApisService
  ) { }

  ngOnInit() {
  }

  back() {
    this.navCtrl.back();
  }

  addcard() {
    if (this.email === '' || this.cname === '' || this.cnumber === '' ||
      this.cvc === '' || this.date === '') {
      // this.util.showToast('All Fields are required', 'danger', 'bottom');
      this.util.showToast(this.util.translate('All Fields are required'), 'danger', 'bottom');
      return false;
    }
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!(emailfilter.test(this.email))) {
      this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
      return false;
    }
    const year = this.date.split('-')[0];
    const month = this.date.split('-')[1];
    if (this.util.userInfo && this.util.userInfo.stripe_key && this.util.userInfo.stripe_key !== '') {
      console.log('add new card');
      const param = {
        'card[number]': this.cnumber,
        'card[exp_month]': month,
        'card[exp_year]': year,
        'card[cvc]': this.cvc
      };
      this.util.show();
      this.api.externalPost('https://api.stripe.com/v1/tokens', param, this.util.stripe).subscribe((data: any) => {
        console.log(data);
        if (data && data.id) {
          // this.token = data.id;
          const newCardInfo = {
            source: data.id
          };
          this.api.externalPost('https://api.stripe.com/v1/customers/' + this.util.userInfo.stripe_key + '/sources',
            newCardInfo, this.util.stripe).subscribe((data) => {
              console.log('new card addedd', data);
              this.util.hide();
              this.back();
            }, error => {
              console.log('error in new card', error);
              this.util.hide();
            });
        } else {
          this.util.hide();
        }
      }, (error: any) => {
        console.log(error);
        this.util.hide();
        console.log();
        if (error && error.error && error.error.error && error.error.error.message) {
          this.util.errorToast(error.error.error.message);
          return false;
        }
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
    } else {
      const param = {
        'card[number]': this.cnumber,
        'card[exp_month]': month,
        'card[exp_year]': year,
        'card[cvc]': this.cvc
      };
      this.util.show();
      this.api.externalPost('https://api.stripe.com/v1/tokens', param, this.util.stripe).subscribe((data: any) => {
        console.log(data);
        if (data && data.id) {
          // this.token = data.id;
          const customer = {
            description: 'Customer for food app',
            source: data.id,
            email: this.email
          };
          this.api.externalPost('https://api.stripe.com/v1/customers', customer, this.util.stripe).subscribe((customer: any) => {
            console.log(customer);
            this.util.hide();
            if (customer && customer.id) {
              // this.cid = customer.id;
              const cid = {
                id: localStorage.getItem('uid'),
                stripe_key: customer.id
              };
              this.updateUser(cid);
            }
          }, error => {
            this.util.hide();
            console.log();
            if (error && error.error && error.error.error && error.error.error.message) {
              this.util.showErrorAlert(error.error.error.message);
              return false;
            }
            this.util.errorToast(this.util.translate('Something went wrong'));
          });
        } else {
          this.util.hide();
        }
      }, (error: any) => {
        console.log(error);
        this.util.hide();
        console.log();
        if (error && error.error && error.error.error && error.error.error.message) {
          this.util.showErrorAlert(error.error.error.message);
          return false;
        }
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
    }
  }

  updateUser(param) {
    this.util.show(this.util.translate('updating...'));
    this.api.post('users/edit_profile', param).then((data: any) => {
      this.util.hide();
      console.log(data);
      const getParam = {
        id: localStorage.getItem('uid')
      };
      this.api.post('users/getById', getParam).then((data: any) => {
        console.log('user info=>', data);
        if (data && data.status === 200 && data.data && data.data.length) {
          this.util.userInfo = data.data[0];
          this.navCtrl.back();
        } else {
          this.navCtrl.back();
        }
      }, error => {
        console.log(error);
      });
    }, error => {
      this.util.hide();
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  getMaxDate(): string {
    return moment().add('50', 'years').format('YYYY-MM-DD');
  }

  minStartDate(): string {
    return moment().format('YYYY-MM-DD');
  }

}
