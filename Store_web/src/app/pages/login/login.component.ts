
import { NavigationExtras, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: any = '';
  password: any = '';

  ccCode: any = '91';
  mobile: any;

  uid: any;
  resendCode: boolean;

  id: any;
  mode: any = 1;
  otp: any;
  selected: any;
  constructor(
    private router: Router,
    public api: ApisService,
    private toastyService: ToastyService,
    private spinner: NgxSpinnerService,
    public util: UtilService
  ) {
    this.selected = localStorage.getItem('language');
  }

  ngOnInit(): void {
  }
  login() {

    if (!this.email || this.email === '' || !this.password || this.password === '') {
      this.error(this.util.translate('All Fields are required'));
      return false;
    }

    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailfilter.test(this.email)) {
      this.error(this.util.translate('Please enter valid email'));
      return false;
    }
    const param = {
      email: this.email,
      password: this.password
    };
    this.spinner.show();
    this.api.post('users/login', param).then((data: any) => {
      this.spinner.hide();
      console.log(data);
      if (data && data.status === 200) {
        if (data && data.data && data.data.type === 'store') {
          if (data.data.status === '1') {
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
            const store = {
              id: data.data.id
            };
            this.api.post('stores/getByUid', store).then((data: any) => {
              this.spinner.hide();
              console.log('*******************', data);
              if (data && data.status === 200 && data.data && data.data.length) {
                this.util.store = data.data[0];
                localStorage.setItem('suid', data.data[0].id);
                this.router.navigate(['']);
              }
            }, error => {
              this.spinner.hide();
              this.error(this.util.translate('Something went wrong'));
              console.log(error);
            });
          } else {
            console.log('not valid');
            Swal.fire({
              title: this.util.translate('Error'),
              text: this.util.translate('Your are blocked please contact administrator'),
              icon: 'error',
              showConfirmButton: true,
              showCancelButton: true,
              confirmButtonText: this.util.translate('Need Help?'),
              backdrop: false,
              background: 'white'
            }).then(status => {
              if (status && status.value) {
                // localStorage.setItem('helpId', data.data.id);
                // this.router.navigate(['inbox']);
                const inboxParam: NavigationExtras = {
                  queryParams: {
                    id: 0,
                    name: 'Support',
                    uid: data.data.id
                  }
                };
                this.router.navigate(['inbox'], inboxParam);
              }
            });
          }
        } else {
          this.error(this.util.translate('Not valid user'));
        }
      } else if (data && data.status === 500) {
        this.error(data.data.message);
      } else {
        this.error(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
    });

  }

  changeLng(item) {
    console.log(item);
    localStorage.setItem('language', item.file);
    window.location.reload();
  }

  error(message) {
    const toastOptions: ToastOptions = {
      title: this.util.translate('Error'),
      msg: message,
      showClose: true,
      timeout: 2000,
      theme: 'default',
      onAdd: (toast: ToastData) => {
        console.log('Toast ' + toast.id + ' has been added!');
      },
      onRemove: () => {
        console.log('Toast  has been removed!');
      }
    };
    // Add see all possible types in one shot
    this.toastyService.error(toastOptions);
  }

  success(message) {
    const toastOptions: ToastOptions = {
      title: this.util.translate('Success'),
      msg: message,
      showClose: true,
      timeout: 2000,
      theme: 'default',
      onAdd: (toast: ToastData) => {
        console.log('Toast ' + toast.id + ' has been added!');
      },
      onRemove: () => {
        console.log('Toast  has been removed!');
      }
    };
    // Add see all possible types in one shot
    this.toastyService.success(toastOptions);
  }

  reset() {
    this.router.navigate(['reset']);
  }

  loginWithPhonePwd() {
    if (!this.mobile || this.mobile === '' || !this.password || this.password === '' || !this.ccCode || this.ccCode === '') {
      this.error(this.util.translate('All Fields are required'));
      return false;
    }
    const param = {
      cc: '+' + this.ccCode,
      mobile: this.mobile,
      password: this.password
    };
    this.spinner.show();
    this.api.post('users/loginWithPhoneAndPassword', param).then((data) => {
      this.spinner.hide();
      console.log(data);
      if (data && data.status === 200) {
        if (data && data.data && data.data.type === 'store') {
          if (data.data.status === '1') {
            localStorage.setItem('uid', data.data.id);
            const store = {
              id: data.data.id
            };
            this.api.post('stores/getByUid', store).then((data: any) => {
              this.spinner.hide();
              console.log('*******************', data);
              if (data && data.status === 200 && data.data && data.data.length) {
                this.util.store = data.data[0];
                localStorage.setItem('suid', data.data[0].id);
                this.router.navigate(['']);
              }
            }, error => {
              this.spinner.hide();
              this.error(this.util.translate('Something went wrong'));
              console.log(error);
            });
          } else {
            console.log('not valid');
            Swal.fire({
              title: this.util.translate('Error'),
              text: this.util.translate('Your are blocked please contact administrator'),
              icon: 'error',
              showConfirmButton: true,
              showCancelButton: true,
              confirmButtonText: this.util.translate('Need Help?'),
              backdrop: false,
              background: 'white'
            }).then(status => {
              if (status && status.value) {

                const inboxParam: NavigationExtras = {
                  queryParams: {
                    id: 0,
                    name: 'Support',
                    uid: data.data.id
                  }
                };
                this.router.navigate(['inbox'], inboxParam);
              }
            });
          }
        } else {
          this.error(this.util.translate('Not valid user'));
        }
      } else if (data && data.status === 500) {
        this.error(data.data.message);
      } else {
        this.error(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
    });
  }

  loginWithOTP() {
    if (!this.mobile || this.mobile === '' || !this.ccCode || this.ccCode === '') {
      this.error(this.util.translate('All Fields are required'));
      return false;
    }
    const param = {
      mobile: this.mobile,
      cc: '+' + this.ccCode
    };
    this.spinner.show();
    this.api.post('users/checkMobileNumber', param).then((data) => {
      this.spinner.hide();
      console.log(data);
      if (data && data.status === 200) {
        console.log('open modal');
        this.mode = 2;
        this.uid = data.data.id;
        this.sendOTP();
        setTimeout(() => {
          this.resendCode = true;
        }, 30000);
      } else if (data && data.status === 500) {
        this.error(data.data.message);
      } else {
        this.error(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
    });
  }

  sendOTP() {
    const mobile = '+' + this.ccCode + this.mobile;
    console.log('send on this number------<<<<<<<', this.mobile);
    console.log(this.mobile);
    this.success(this.util.translate('We texted you a code to verify') + ' ' + this.util.translate('your phone') + ' ' + mobile)
    const message = this.util.translate('Your S2ftech app verification code : ');
    const param = {
      msg: message,
      to: mobile
    };
    console.log(param);
    this.spinner.show();
    this.api.post('users/twilloMessage', param).then((data: any) => {
      console.log(data);
      this.id = data.data.id;
      this.spinner.hide();
    }, error => {
      console.log(error);
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
    });
  }

  verifyOTP() {
    if (this.otp === '' || !this.otp) {
      this.error(this.util.translate('Not valid code'));
      return false;
    }
    if (this.otp) {
      const param = {
        id: this.id,
        otp: this.otp
      };
      this.spinner.show();
      this.api.post('users/verifyOTP', param).then((data: any) => {
        console.log(data);
        this.spinner.hide();
        if (data && data.status === 200) {
          this.done();
        } else {
          if (data && data.status === 500 && data.data && data.data.message) {
            this.error(data.data.message);
            return false;
          }
          this.error(this.util.translate('Something went wrong'));
          return false;
        }
      }, error => {
        this.spinner.hide();
        console.log(error);
        this.error(this.util.translate('Something went wrong'));
      });
    } else {
      this.error(this.util.translate('Not valid code'));
      return false;
    }
  }

  done() {
    const param = {
      id: this.uid
    };
    this.spinner.show();
    this.api.post('users/getById', param).then((data: any) => {
      console.log('user data', data);
      if (data && data.status === 200 && data.data && data.data.length && data.data[0].type === 'store') {

        if (data && data.data && data.data[0].type === 'store') {
          if (data.data[0].status === '1') {
            localStorage.setItem('uid', this.uid);
            const store = {
              id: this.uid
            };
            this.api.post('stores/getByUid', store).then((data: any) => {
              this.spinner.hide();
              console.log('*******************', data);
              if (data && data.status === 200 && data.data && data.data.length) {
                this.util.store = data.data[0];
                localStorage.setItem('suid', data.data[0].id);
                this.router.navigate(['']);
              }
            }, error => {
              this.spinner.hide();
              this.error(this.util.translate('Something went wrong'));
              console.log(error);
            });
          } else {
            console.log('not valid');
            Swal.fire({
              title: this.util.translate('Error'),
              text: this.util.translate('Your are blocked please contact administrator'),
              icon: 'error',
              showConfirmButton: true,
              showCancelButton: true,
              confirmButtonText: this.util.translate('Need Help?'),
              backdrop: false,
              background: 'white'
            }).then(status => {
              if (status && status.value) {
                const inboxParam: NavigationExtras = {
                  queryParams: {
                    id: 0,
                    name: 'Support',
                    uid: this.uid
                  }
                };
                this.router.navigate(['inbox'], inboxParam);
              }
            });
          }
        } else {
          this.error(this.util.translate('Not valid user'));

        }
      } else if (data && data.status === 500) {
        this.error(data.data.message);
      } else {
        this.error(this.util.translate('Something went wrong'));
      }
    }, error => {
      localStorage.removeItem('uid');
      console.log(error);
    });
  }
}
