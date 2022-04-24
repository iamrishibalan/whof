
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import { PreviewPage } from '../preview/preview.page';
var index = 1;
declare var $: any;
@Component({
  selector: 'app-addservice',
  templateUrl: './addservice.page.html',
  styleUrls: ['./addservice.page.scss'],
})
export class AddservicePage implements OnInit {
  categories: any[] = [];
  name: any;
  cid: any;
  price: any;
  descriptions: any;
  image: any = '';
  coverImage: any;
  isEdit: boolean = false;
  ratting: any;
  id: any;
  veg: any = '1';
  status: any = '1';
  variations: any[] = [];
  size: any = '0';
  constructor(
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    public util: UtilService,
    public api: ApisService,
    private router: Router,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private modalCtrl: ModalController) {
      this.category();
      this.category();
      this.route.queryParams.subscribe(data => {
        console.log('data=>', data);
        if (data.hasOwnProperty('id')) {
          this.id = data.id;
          this.isEdit = true;
          this.getProduct();
        } else {
          this.isEdit = false;
        }
      });
  }


  category() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post('categories/getByRestId', param).then((data: any) => {
      if (data && data.status === 200 && data.data.length) {
        this.categories = data.data;
      }
    }, error => {
      console.log(error);
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  getProduct() {
    const param = {
      id: this.id
    };
    this.util.show();
    this.api.post('products/getById', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status === 200 && data.data.length > 0) {
        const info = data.data[0];
        console.log('info->', info);
        this.name = info.name;
        this.descriptions = info.details;
        this.coverImage = info.cover;
        this.cid = info.cid;
        this.price = info.price;
        this.size = info.size;
        this.status = info.status;
        this.veg = info.veg;
        if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.variations)) {
          this.variations = JSON.parse(info.variations);
        }
      } else {
        this.util.errorToast(this.util.translate('Product not found'));
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
  }
  ngOnInit() {

  }
  submit() {
    if (this.name === '' || !this.name || this.cid === '' ||
      !this.cid || this.price === '' || !this.price || this.descriptions === '' || !this.descriptions) {
      this.util.errorToast(this.util.translate('All Fields are required'));
      return false;
    }
    // if (!this.coverImage || this.coverImage === '') {
    //   this.util.errorToast(this.util.translate('Please add your cover image'));
    //   return false;
    // }
    if (this.isEdit && this.id) {
      const param = {
        restId: localStorage.getItem('uid'),
        cid: this.cid,
        name: this.name,
        price: this.price,
        details: this.descriptions,
        cover: this.coverImage,
        veg: '5',
        status: this.status,
        variations: '',
        size: '',
        id: this.id
      };
      this.util.show();
      this.api.post('products/editList', param).then((data: any) => {
        this.util.hide();
        if (data && data.status === 200) {
          this.util.showToast(this.util.translate('Service updated Successfully'), 'success', 'bottom');
          this.navCtrl.back();
        } else {
          this.util.errorToast(this.util.translate('Something went wrong'));
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
    } else {
      const param = {
        restId: localStorage.getItem('uid'),
        cid: this.cid,
        name: this.name,
        price: this.price,
        details: this.descriptions,
        cover: this.coverImage,
        rating: 0,
        veg: '5',
        status: 1,
        variations: JSON.stringify(this.variations),
        size: this.size,
      };
      this.util.show();
      this.api.post('products/save', param).then((data: any) => {
        this.util.hide();
        if (data && data.status === 200) {
          this.util.showToast(this.util.translate('Food Added Successfully'), 'success', 'bottom');
          this.navCtrl.back();
        } else {
          this.util.errorToast(this.util.translate('Something went wrong'));
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

    }

  }
  async cover() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose from'),
      mode: 'ios',
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
  opemCamera(type) {
    try {
      const options: CameraOptions = {
        quality: 100,
        targetHeight: 800,
        targetWidth: 800,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        sourceType: type === 'camera' ? this.camera.PictureSourceType.CAMERA : this.camera.PictureSourceType.PHOTOLIBRARY
      };
      this.camera.getPicture(options).then((url) => {
        console.log('url->', url);
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
          this.coverImage = info.data;
          console.log('cover image', this.coverImage);
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate('Something went wrong'));
        }).catch(error => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
      });

    } catch (error) {
      console.log('error', error);
    }
  }
  
  delete(item) {
    console.log(item);
    if (item.title === 'size') {
      this.size = false;
    }

    this.variations = this.variations.filter(x => x.title !== item.title);
  }

  async addItem(index) {
    console.log(this.variations[index]);
    const alert = await this.alertController.create({
      header: 'Add item to ' + this.variations[index].title,
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Add-ons name'
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Add-ons price'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok');
            if (data && data.title && data.price) {
              const item = {
                title: data.title,
                price: data.price
              };
              this.variations[index].items.push(item);
              console.log(this.variations);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  deleteSub(index, item) {
    console.log(index);
    console.log(item);
    const selected = this.variations[index].items;
    console.log('selected', selected);
    const data = selected.filter(x => x.title !== item.title);
    console.log(data);
    this.variations[index].items = data;
    console.log('done', this.variations);
  }

  async editSub(index, items, subIndex) {
    console.log(index, items, subIndex);
    console.log(this.variations);
    const alert = await this.alertController.create({
      header: 'Edit item ' + this.variations[index].title,
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Variation name',
          value: this.variations[index].items[subIndex].title
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Variation price',
          value: this.variations[index].items[subIndex].price
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok');
            this.variations[index].items[subIndex].title = data.title;
            this.variations[index].items[subIndex].price = data.price;
            console.log(this.variations);
          }
        }
      ]
    });

    await alert.present();
  }
}
