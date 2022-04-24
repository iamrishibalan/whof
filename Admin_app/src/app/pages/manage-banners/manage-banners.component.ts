
import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import { Location } from '@angular/common';
@Component({
  selector: 'app-manage-banners',
  templateUrl: './manage-banners.component.html',
  styleUrls: ['./manage-banners.component.scss']
})
export class ManageBannersComponent implements OnInit {

  type: any;
  coverImage: any;
  value: any;
  restId: any;
  banner_to_upload: any = '';
  edit: boolean;
  message: any = '';
  id: any;

  restaurants: any[] = [];
  dummyRest: any[] = [];
  constructor(
    public api: ApisService,
    private spinner: NgxSpinnerService,
    private toastyService: ToastyService,
    private route: ActivatedRoute,
    private navCtrl: Location
  ) {
    this.api.auth();
    this.route.queryParams.subscribe((data) => {
      if (data && data.id) {
        this.edit = true;
        this.id = data.id;
        this.getById();
      } else {
        this.edit = false;
        this.getStore(false);
      }
    });

  }

  ngOnInit(): void {
  }

  getById() {
    const param = {
      id: this.id
    };

    this.spinner.show();
    this.api.post('banners/getById', param).then((data: any) => {
      console.log(data);
      this.spinner.hide();
      if (data && data.status === 200 && data.data && data.data.length) {
        const info = data.data[0];
        this.type = info.type;
        this.coverImage = info.banner;
        if (this.type === '1') {
          this.value = info.value;
        } else {
          this.getStore(true, info.value);
        }
        this.message = info.message;
      } else {
        this.error(this.api.translate('Something went wrong'));
      }
    }).catch((error) => {
      console.log(error);
      this.spinner.hide();
      this.error(this.api.translate('Something went wrong'));
    });
  }

  getStore(values, id?) {
    this.restaurants = [];
    this.dummyRest = Array(10);
    this.api.get('stores').then((datas: any) => {
      console.log(datas);
      this.dummyRest = [];
      if (datas && datas.data.length) {
        this.dummyRest = datas.data;
        if (values) {
          const info = this.dummyRest.filter(x => x.uid === id);
          console.log(info);
          this.value = info[0].name;
        }
      }
    }, error => {
      console.log(error);
      this.error(this.api.translate('Something went wrong'));
      this.dummyRest = [];
    }).catch(error => {
      console.log(error);
      this.error(this.api.translate('Something went wrong'));
    });
  }
  searchRest(str) {
    console.log(str);
    this.resetChanges();
    this.restaurants = this.filterItems(str);
    console.log(this.restaurants);
  }

  selectRest(item) {
    console.log(item);
    this.value = item.name;
    this.restId = item.uid;
    this.restaurants = [];
  }
  filterItems(searchTerm) {
    return this.dummyRest.filter((item) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  protected resetChanges = () => {
    this.restaurants = this.dummyRest;
  }

  error(message) {
    const toastOptions: ToastOptions = {
      title: this.api.translate('Error'),
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
      title: this.api.translate('Success'),
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
          this.coverImage = data.data;
        }
      }, err => {
        console.log(err);
        this.spinner.hide();
      });
    } else {
      console.log('no');
    }
  }

  create() {
    console.log('create');
    console.log(this);
    if (!this.type || this.type === '' || !this.value || this.value === '') {
      this.error('All Fields are required');
      return false;
    }
    if (this.coverImage === '' || !this.coverImage) {
      this.error(this.api.translate('Please add image'));
      return false;
    }

    const param = {
      banner: this.coverImage,
      value: this.type === '0' ? this.restId : this.value,
      type: this.type,
      message: this.message,
      status: 1
    };
    this.spinner.show();
    this.api.post('banners/save', param).then((data: any) => {
      this.spinner.hide();
      console.log(data);
      if (data && data.status && data.status === 200) {
        this.api.alerts(this.api.translate('Success'), this.api.translate('Banner Added'), 'success');
        this.navCtrl.back();
      } else {
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

  update() {
    console.log('update');
    console.log('create');
    console.log(this);
    if (!this.type || this.type === '' || !this.value || this.value === '') {
      this.error('All Fields are required');
      return false;
    }
    if (this.coverImage === '' || !this.coverImage) {
      this.error(this.api.translate('Please add image'));
      return false;
    }
    const param = {
      banner: this.coverImage,
      value: this.type === '0' ? this.restId : this.value,
      type: this.type,
      message: this.message,
      status: 1,
      id: this.id
    };
    this.spinner.show();
    this.api.post('banners/editList', param).then((data: any) => {
      this.spinner.hide();
      console.log(data);
      if (data && data.status && data.status === 200) {
        this.api.alerts(this.api.translate('Success'), this.api.translate('Updated!'), 'success');
        this.navCtrl.back();
      } else {
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
}
