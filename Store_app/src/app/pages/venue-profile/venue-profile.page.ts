
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { ActionSheetController, IonSearchbar } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Observable } from 'rxjs';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as moment from 'moment';
declare var google: any;

@Component({
  selector: 'app-venue-profile',
  templateUrl: './venue-profile.page.html',
  styleUrls: ['./venue-profile.page.scss'],
})
export class VenueProfilePage implements OnInit {
  @ViewChild('searchbar', { read: IonSearchbar, static: true }) searchbar: IonSearchbar;
  id: any;
  image: any = '';
  coverImage: any;
  image1: any;
  image2: any;
  image3: any;
  image4: any;
  image5: any;
  image6: any;
  name: any = '';
  address: any = '';
  descritions: any = '';
  haveData: boolean = false;
  dishPrice: any = '';
  time: any = '';
  latitude: any;
  longitude: any;
  cusine: any;
  phone: any = '';
  email;
  openTime;
  closeTime;
  status: any = '';
  isClosed: any;
  StoreDet: boolean;
  Saloondet: boolean;
  constructor(
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    public util: UtilService,
    public api: ApisService,
    private navCtrl: NavController,
    private router: Router
  ) {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post('stores/getByUid', param).then((data: any) => {
      console.log('*******************', data);
      if (data && data.status === 200 && data.data && data.data.length) {
        const info = data.data[0];
        this.name = info.name;
        this.address = info.address;
        this.dishPrice = info.dish;
        this.phone = info.mobile;
        this.openTime = info.open_time;
        this.closeTime = info.close_time;
        this.latitude = info.lat;
        this.longitude = info.lng;
        this.time = info.time;
        this.descritions = info.descriptions;
        this.coverImage = info.cover;
        this.id = info.id;
        if (info.cusine && info.cusine !== '') {
          this.cusine = JSON.parse(info.cusine);
        } else {
          this.cusine = [];
        }
        this.isClosed = info.isClosed;
        if (info.images) {
          const images = JSON.parse(info.images);
          console.log('images======>>>', images);
          if (images[0]) {
            this.image1 = images[0];
          }
          if (images[1]) {
            this.image2 = images[1];
          }
          if (images[2]) {
            this.image3 = images[2];
          }
          if (images[3]) {
            this.image4 = images[3];
          }
          if (images[4]) {
            this.image5 = images[4];
          }
          if (images[5]) {
            this.image6 = images[5];
          }
        }
      } else {
        localStorage.clear();
        this.navCtrl.navigateRoot(['/login']);
      }
    }, error => {
      console.log(error);
    });
  }
  ngOnInit() {
    let val = localStorage.getItem('type');
    if (val == 'store') {
      this.Saloondet = false;
      this.StoreDet = true;
    }
    else if (val == 'saloon') {
      this.Saloondet = true;
      this.StoreDet = false;
    }
  }

  updateSearch() {
  }

  updateVenue() {
    const images = [
      this.image1 ? this.image1 : '',
      this.image2 ? this.image2 : '',
      this.image3 ? this.image3 : '',
      this.image4 ? this.image4 : '',
      this.image5 ? this.image5 : '',
      this.image6 ? this.image6 : ''
    ];
    this.openTime = moment(this.openTime).format('HH:mm');
    this.closeTime = moment(this.closeTime).format('HH:mm');
    if (this.openTime === 'Invalid date') {
      this.openTime = '10:00';
    }
    if (this.closeTime === 'Invalid date') {
      this.closeTime = '22:00';
    }
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
          cover: this.coverImage,
          open_time: this.openTime,
          close_time: this.closeTime,
          id: this.id,
          dish: this.dishPrice,
          time: this.time,
          cusine: JSON.stringify(this.cusine),
          images: JSON.stringify(images),
          mobile: this.phone,
          isClosed: this.isClosed
        };
        this.util.show();
        console.log('param', param);
        this.api.post('stores/editList', param).then((datas: any) => {
          console.log(datas);
          this.util.hide();
          if (datas && datas.status === 200) {
            this.navCtrl.back();
          } else {
            this.util.hide();
            this.util.errorToast(this.util.translate('Something went wrong'));
          }
        }, error => {
          this.util.hide();
          console.log(error);
          this.util.errorToast(this.util.translate('Something went wrong'));
        }).catch(error => {
          this.util.hide();
          console.log(error);
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
      } else {
        this.util.errorToast(this.util.translate('Something went wrong'));
        return false;
      }
    });


  }

  submit() {
    console.log('cusine', this.cusine);
    if (this.name === '' || this.address === '' || this.descritions === '' || this.dishPrice === '' || this.time === '' ||
      !this.cusine || !this.cusine.length || this.openTime === '' || this.closeTime === '' || !this.openTime ||
      !this.closeTime || this.phone === '' || !this.phone) {
      this.util.errorToast(this.util.translate('All Fields are required'));
      return false;
    }
    if (!this.coverImage || this.coverImage === '') {
      this.util.errorToast(this.util.translate('Please add your cover image'));
      return false;
    }
    console.log('update');
    this.updateVenue();
  }

  submit1() {
    console.log('cusine', this.cusine);
    if (this.name === '' || this.address === '' || this.descritions === '' ||
      this.openTime === '' || this.closeTime === '' || !this.openTime ||
      !this.closeTime || this.phone === '' || !this.phone) {
      this.util.errorToast(this.util.translate('All Fields are required'));
      return false;
    }
    if (!this.coverImage || this.coverImage === '') {
      this.util.errorToast(this.util.translate('Please add your cover image'));
      return false;
    }
    console.log('update');
    this.updateVenue();
  }

  async cover() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose from'),
      buttons: [{
        text: this.util.translate('Camera'),
        icon: 'camera',
        handler: () => {
          console.log('Delete clicked');
          this.opemCamera('camera');
        }
      }, {
        text: this.util.translate('Gallery'),
        icon: 'image',
        handler: () => {
          console.log('Share clicked');
          this.opemCamera('gallery');
        }
      }, {
        text: this.util.translate('Cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  async others(num) {
    console.log('num', num);
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose from'),
      buttons: [{
        text: this.util.translate('Camera'),
        icon: 'camera',
        handler: () => {
          console.log('Delete clicked');
          this.opemCamera('camera', num);
        }
      }, {
        text: this.util.translate('Gallery'),
        icon: 'image',
        handler: () => {
          console.log('Share clicked');
          this.opemCamera('gallery', num);
        }
      }, {
        text: this.util.translate('Cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }



  opemCamera(type, num?) {
    const options: CameraOptions = {
      quality: 100,
      targetHeight: 700,
      targetWidth: 700,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: type === 'camera' ? 1 : 0
    };
    console.log('open');
    this.camera.getPicture(options).then((url) => {
      this.util.show();
      const alpha = {
        img: url,
        type: 'jpg'
      };
      console.log('parma==>', alpha);
      this.api.nativePost('users/upload_file', alpha).then((data) => {
        this.util.hide();
        console.log('data', JSON.parse(data.data));
        const info = JSON.parse(data.data);
        console.log('numm-0-->>', num);
        if (!num) {
          console.log('cover!!!');
          this.coverImage = info.data;
        } else {
          console.log('num');
          if (num === 1 || num === '1') {
            this.image1 = info.data;
          }
          if (num === 2 || num === '2') {
            this.image2 = info.data;
          }
          if (num === 3 || num === '3') {
            this.image3 = info.data;
          }
          if (num === 4 || num === '4') {
            this.image4 = info.data;
          }
          if (num === 5 || num === '5') {
            this.image5 = info.data;
          }
          if (num === 6 || num === '6') {
            this.image6 = info.data;
          }
        }

      }, error => {
        console.log(error);
        this.util.hide();
        this.util.errorToast(this.util.translate('Something went wrong'));
      }).catch(error => {
        console.log(error);
        this.util.hide();
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
    }, (err) => {
      this.util.hide();
      console.log(err);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

}
