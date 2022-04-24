
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';

import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { ApisService } from 'src/app/services/apis.service';
import { environment } from 'src/environments/environment';
import { UtilService } from 'src/app/services/util.service';

declare var google: any;
@Component({
  selector: 'app-manage-stores',
  templateUrl: './manage-stores.component.html',
  styleUrls: ['./manage-stores.component.scss']
})
export class ManageStoresComponent implements OnInit {
  @ViewChild('placesRef', { static: false }) placesRef: GooglePlaceDirective;

  banner_to_upload: any = '';
  id: any;
  new: boolean;
  address: any = '';
  latitude: any;
  longitude: any;

  coverImage: any;
  gender: any = 1;

  name: any = '';
  descritions: any = '';
  haveData: boolean = false;
  time: any = '';
  commission: any;
  email: any = '';
  openTime;
  closeTime;
  fname: any = '';
  lname: any = '';
  password: any = '';
  phone: any = '';
  city: any = '';
  totalSales: any = 0;
  totalOrders: any = 0;
  reviews: any[] = [];
  cities: any[] = [];
  fileURL: any;
  orders: any[] = [];
  dish: any;
  deliveryTime: any;
  mobileCcode: any = this.api.default_country_code;
  uid: any;
  constructor(
    private route: ActivatedRoute,
    public api: ApisService,
    private toastyService: ToastyService,
    private spinner: NgxSpinnerService,
    private navCtrl: Location,
    private chMod: ChangeDetectorRef,
    public util: UtilService
  ) {
    this.api.auth();
    this.getCity();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log('data=>', data);
      this.new = data.register === 'true' ? true : false;
      console.log(this.new);
      if (data && data.id && data.register) {
        this.id = data.id;
        this.getVenue();

      }
    });
  }

  getOrders() {


    const param = {
      id: this.uid
    };

    this.api.post('orders/getByStore', param).then((data: any) => {
      console.log('by store id', data);
      let total = 0;
      if (data && data.status === 200 && data.data.length > 0) {
        data.data.forEach(async (element) => {
          total = total + parseFloat(element.total);
          element.orders = JSON.parse(element.orders);
          this.orders.push(element);
        });
        setTimeout(() => {
          function percentage(num, per) {
            return (num / 100) * per;
          }
          console.log(total, this.commission);
          const totalPrice = percentage(total, parseFloat(this.commission));
          console.log('commistion=====>>>>>', totalPrice.toFixed(2));
          this.totalSales = totalPrice.toFixed(2);
        }, 1000);
      }
    }, error => {
      console.log(error);
      this.error('Something went wrong');
    }).catch(error => {
      console.log(error);
      this.error('Something went wrong');
    });
  }

  getReviews() {
    const param = {
      id: this.uid,
      where: 'sid = ' + this.uid
    };

    this.api.post('rating/getFromIDs', param).then((data: any) => {
      console.log(data);
      if (data && data.status === 200) {
        this.reviews = data.data;
      }
    }, error => {
      console.log(error);
      this.error('Something went wrong');
    }).catch(error => {
      console.log(error);
      this.error('Something went wrong');
    });
  }

  getVenue() {
    this.spinner.show();
    const param = {
      id: this.id
    };
    this.api.post('stores/getById', param).then((datas: any) => {
      console.log(datas);
      this.spinner.hide();
      if (datas && datas.status === 200 && datas.data.length) {
        const info = datas.data[0];
        console.log('-------->', info);
        this.city = info.cid;
        this.uid = info.uid;
        this.name = info.name;
        this.address = info.address;
        this.latitude = info.lat;
        this.longitude = info.lng;
        this.fileURL = info.cover;
        this.coverImage = environment.mediaURL + info.cover;
        this.descritions = info.descriptions;
        this.openTime = info.open_time;
        this.closeTime = info.close_time;
        this.commission = info.commission;
        this.dish = info.dish;
        this.deliveryTime = info.time;
        this.getOrders();
        this.getReviews();

      } else {
        this.spinner.hide();
        this.error(this.api.translate('Something went wrong'));
      }
    }, error => {
      this.spinner.hide();
      console.log(error);
      this.error(this.api.translate('Something went wrong'));
    }).catch(error => {
      this.spinner.hide();
      console.log(error);
      this.error(this.api.translate('Something went wrong'));
    });
  }

  getImage(cover) {
    return cover ? cover : 'assets/icon.png';
  }
  getDate(date) {
    return moment(date).format('llll');
  }

  getCity() {
    this.api.get('cities').then((datas: any) => {
      console.log(datas);
      if (datas && datas.data.length) {
        this.cities = datas.data;
      }
    }, error => {
      console.log(error);
      this.error(this.api.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.error(this.api.translate('Something went wrong'));
    });
  }

  public handleAddressChange(address: Address) {
    console.log(address);
    this.address = address.formatted_address;
    this.latitude = address.geometry.location.lat();
    this.longitude = address.geometry.location.lng();
    console.log('=>', this.latitude);
  }

  updateVenue() {

    console.log(this.name, this.address, this.descritions, this.time,
      this.openTime, this.closeTime);
    if (this.name === '' || this.address === '' || this.descritions === '' || this.openTime === '' || this.closeTime === ''
      || !this.openTime || !this.closeTime || this.deliveryTime === '' || this.dish === '') {
      this.error(this.api.translate('All Fields are required'));
      return false;
    }

    if (!this.coverImage || this.coverImage === '') {
      this.error(this.api.translate('Please add your cover image'));
      return false;
    }
    this.spinner.show();
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode({ address: this.address }, (results, status) => {
      console.log(results, status);
      if (status === 'OK' && results && results.length) {
        this.latitude = results[0].geometry.location.lat();
        this.longitude = results[0].geometry.location.lng();
        console.log('----->', this.latitude, this.longitude);
        const param = {
          name: this.name,
          address: this.address,
          descriptions: this.descritions,
          lat: this.latitude,
          lng: this.longitude,
          cover: this.fileURL,
          open_time: this.openTime,
          close_time: this.closeTime,
          cid: this.city,
          id: this.id,
          commission: this.commission,
          dish: this.dish,
          time: this.deliveryTime,
        };
        console.log('param', param);

        this.api.post('stores/editList', param).then((datas: any) => {
          console.log(datas);
          this.spinner.hide();
          if (datas && datas.status === 200) {
            this.navCtrl.back();
          } else {
            this.spinner.hide();
            this.error(this.api.translate('Something went wrong'));
          }

        }, error => {
          this.spinner.hide();
          console.log(error);
          this.error(this.api.translate('Something went wrong'));
        }).catch(error => {
          this.spinner.hide();
          console.log(error);
          this.error(this.api.translate('Something went wrong'));
        });
      } else {
        this.spinner.hide();
        alert('Geocode was not successful for the following reason: ' + status);
        return false;
      }
    });




  }

  create() {
    console.log(this.email, this.fname, this.lname, this.phone, this.password, this.name, this.address, this.descritions, this.time)
    if (this.email === '' || this.fname === '' || this.lname === '' || this.phone === '' || this.password === ''
      || this.name === '' || this.address === '' || this.descritions === ''
      || this.city === '' || !this.city || this.openTime === '' || this.closeTime === '' ||
      !this.openTime || !this.closeTime || !this.commission || this.commission === '' || this.deliveryTime === '' || this.dish === '') {
      this.error(this.api.translate('All Fields are required'));
      return false;
    }

    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!(emailfilter.test(this.email))) {
      this.error(this.api.translate('Please enter valid email'));
      return false;
    }

    if (!this.coverImage || this.coverImage === '') {
      this.error(this.api.translate('Please add your cover image'));
      return false;
    }
    this.spinner.show();
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode({ address: this.address }, (results, status) => {
      console.log(results, status);
      if (status === 'OK' && results && results.length) {
        this.latitude = results[0].geometry.location.lat();
        this.longitude = results[0].geometry.location.lng();
        console.log('----->', this.latitude, this.longitude);
        const userParam = {
          first_name: this.fname,
          last_name: this.lname,
          email: this.email,
          password: this.password,
          gender: this.gender,
          fcm_token: 'NA',
          type: 'store',
          lat: this.latitude,
          lng: this.longitude,
          cover: this.fileURL,
          mobile: this.phone,
          status: 1,
          verified: 1,
          others: 1,
          date: moment().format('YYYY-MM-DD'),
          stripe_key: '',
          country_code: '+' + this.mobileCcode
        };

        console.log('user param', userParam);
        this.api.post('users/registerUser', userParam).then((data: any) => {
          console.log('datatatrat=a=ta=t=at=', data);
          if (data && data.data && data.status === 200) {
            const storeParam = {
              uid: data.data.id,
              name: this.name,
              mobile: this.phone,
              lat: this.latitude,
              lng: this.longitude,
              verified: 1,
              address: this.address,
              descriptions: this.descritions,
              images: '[]',
              cover: this.fileURL,
              status: 1,
              open_time: this.openTime,
              close_time: this.closeTime,
              isClosed: 1,
              certificate_url: '',
              certificate_type: '',
              rating: 0,
              total_rating: 0,
              cid: this.city,
              commission: this.commission,
              dish: this.dish,
              time: this.deliveryTime,
              cusine: ''
            };
            console.log('****', storeParam);
            this.api.post('stores/save', storeParam).then((salons: any) => {
              console.log('salonaasssss--', salons);
              this.spinner.hide();
              this.navCtrl.back();
            }, error => {
              this.spinner.hide();
              console.log(error);
              this.error(this.api.translate('Something went wrong'));
            }).catch(error => {
              this.spinner.hide();
              console.log(error);
              this.error(this.api.translate('Something went wrong'));
            });
          } else {
            this.spinner.hide();
            if (data && data.data && data.data.message) {
              this.error(data.data.message);
              return false;
            }
            this.error(data.message);
            return false;
          }
        }, error => {
          this.spinner.hide();
          console.log(error);
          this.error(this.api.translate('Something went wrong'));
        }).catch(error => {
          this.spinner.hide();
          console.log(error);
          this.error(this.api.translate('Something went wrong'));
        });
      } else {
        this.spinner.hide();
        alert('Geocode was not successful for the following reason: ' + status);
        return false;
      }
    });


  }

  error(message) {
    const toastOptions: ToastOptions = {
      title: 'Error',
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
      title: 'Success',
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

  preview_banner(files) {

    console.log('fle', files);
    this.banner_to_upload = [];
    if (files.length === 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    this.banner_to_upload = files;
    if (this.banner_to_upload) {
      console.log('ok');
      this.spinner.show();
      this.api.uploadFile(this.banner_to_upload).subscribe((data: any) => {
        console.log('==>>', data);
        this.spinner.hide();
        if (data && data.status === 200 && data.data) {
          this.fileURL = data.data;
          this.coverImage = environment.mediaURL + data.data;
        }
      }, err => {
        console.log(err);
        this.spinner.hide();
      });
    } else {
      console.log('no');
    }
  }

  getCurrency() {
    return this.api.getCurrecySymbol();
  }
}
