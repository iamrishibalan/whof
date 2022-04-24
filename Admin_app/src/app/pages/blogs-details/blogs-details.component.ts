
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApisService } from 'src/app/services/apis.service';
import { ActivatedRoute } from '@angular/router';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import * as moment from 'moment';
@Component({
  selector: 'app-blogs-details',
  templateUrl: './blogs-details.component.html',
  styleUrls: ['./blogs-details.component.scss']
})
export class BlogsDetailsComponent implements OnInit {
  title: any;
  cover: any;
  cotent: any;
  edit: boolean;
  id: any;
  status: any;
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
    this.api.post('blogs/getById', param).then((data: any) => {
      console.log(data);
      this.spinner.hide();
      if (data && data.status === 200 && data.data && data.data.length) {
        const info = data.data[0];
        console.log(info);
        this.title = info.title;
        this.cotent = info.content;
        this.cover = info.cover;
        this.status = info.status;
      } else {
        this.navCtrl.back();
        this.error(this.api.translate('Something went wrong'));
      }
    }).catch((error) => {
      console.log(error);
      this.spinner.hide();
      this.navCtrl.back();
      this.error(this.api.translate('Something went wrong'));
    });
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
    if (files.length === 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    if (files) {
      console.log('ok');
      this.spinner.show();
      this.api.uploadFile(files).subscribe((data: any) => {
        console.log('==>>', data);
        this.spinner.hide();
        if (data && data.status === 200 && data.data) {
          this.cover = data.data;
        }
      }, err => {
        console.log(err);
        this.spinner.hide();
      });
    } else {
      console.log('no');
    }
  }

  onChange(event) {
  }

  onEditorChange(event) {
  }

  submit() {
    console.log('its', this.edit);
    if (!this.title || this.title === '' || !this.cotent || this.cotent === '') {
      this.error('All Fields are required');
      return false;
    }
    if (!this.cover || this.cover === '') {
      this.error(this.api.translate('Please add image'));
      return false;
    }
    if (this.edit) {
      this.updateContent();
    } else {
      this.createContent();
    }

  }

  createContent() {
    const param = {
      title: this.title,
      content: this.cotent,
      cover: this.cover,
      published: moment().format('YYYY-MM-DD'),
      status: 1
    }
    console.log(param);
    this.spinner.show();
    this.api.post('blogs/save', param).then((data: any) => {
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

  updateContent() {
    const param = {
      id: this.id,
      title: this.title,
      content: this.cotent,
      cover: this.cover,
      published: moment().format('YYYY-MM-DD'),
      status: this.status
    }
    console.log(param);
    this.spinner.show();
    this.api.post('blogs/editList', param).then((data: any) => {
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
