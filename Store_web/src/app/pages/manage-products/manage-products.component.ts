import { Location } from '@angular/common';

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { ToastyService, ToastData, ToastOptions } from 'ng2-toasty';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-manage-products',
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.css']
})
export class ManageProductsComponent implements OnInit {

  @ViewChild('contentVarient', { static: false }) contentVarient: any;
  @ViewChild('newAddone', { static: false }) newAddone: any;
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
  subString: any = '';

  variant_title: any = '';
  variant_price: any;
  variatIndex: any;
  subIndex: any;

  sub: boolean;
  addonName: any;
  addonType: any = 'radio';
  constructor(
    public api: ApisService,
    public util: UtilService,
    public route: ActivatedRoute,
    private navCtrl: Location,
    private toastyService: ToastyService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      this.getCates();
      if (data && data.id) {
        this.id = data.id;
        this.isEdit = true;
        this.getProduct();
      } else {
        this.isEdit = false;
      }
    });
  }

  getProduct() {
    const param = {
      id: this.id
    };
    this.spinner.show();
    this.api.post('products/getById', param).then((data: any) => {
      console.log(data);
      this.spinner.hide();
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
        this.error(this.util.translate('Product not found'));
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

  getCates() {
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
      this.error(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      console.log(error);
      this.error(this.util.translate('Something went wrong'));
    });
  }
  ngOnInit(): void {
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

  changeSize(event) {
    console.log(event);
    this.size = event;
    console.log(this.size);
    if (this.size === '1') {
      const items = this.variations.filter(x => x.title === 'size');
      console.log('length', items);
      if (!items.length) {
        const item = {
          title: 'size',
          type: 'radio',
          items: []
        };
        this.variations.push(item);
        console.log(this.variations);
      }
    } else {
      this.variations = this.variations.filter(x => x.title !== 'size');
      console.log(this.variations);
    }
  }


  async addItem(index) {
    console.log(this.variations[index]);
    this.sub = false;
    this.variatIndex = index;
    this.variant_price = 0;
    this.variant_title = '';
    console.log(status);
    try {
      this.modalService.open(this.contentVarient, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log(reason);
      });
    } catch (error) {
      console.log(error);
    }
  }

  delete(item) {
    console.log(item);
    if (item.title === 'size') {
      this.size = false;
    }
    this.variations = this.variations.filter(x => x.title !== item.title);
  }

  close3() {
    if (this.sub === false) {
      if (this.variant_title && this.variant_price && this.variant_price !== 0 && this.variant_price > 0) {
        const item = {
          title: this.variant_title,
          price: parseFloat(this.variant_price),
        };
        this.variations[this.variatIndex].items.push(item);
        this.modalService.dismissAll();
        this.variant_title = '';
        this.variant_price = 0;

        this.variatIndex = '';
      } else {
        this.error(this.util.translate('Please add title and price'));
      }
    } else {
      if (this.variant_title && this.variant_price && this.variant_price !== 0 && this.variant_price > 0) {
        this.variations[this.variatIndex].items[this.subIndex].title = this.variant_title;
        this.variations[this.variatIndex].items[this.subIndex].price = parseFloat(this.variant_price);

        this.modalService.dismissAll();
      } else {
        this.error(this.util.translate('Please add title and price'));
      }
    }

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
    console.log(this.variations[index].items[subIndex]);
    this.sub = true;
    this.variatIndex = index;
    this.subIndex = subIndex;
    this.variant_title = this.variations[index].items[subIndex].title;
    this.variant_price = this.variations[index].items[subIndex].price;

    try {
      this.modalService.open(this.contentVarient, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log(reason);
      });
    } catch (error) {
      console.log(error);
    }
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

    const param = {
      restId: localStorage.getItem('uid'),
      cid: this.cid,
      name: this.name,
      price: this.price,
      details: this.descriptions,
      cover: this.coverImage,
      rating: 0,
      veg: this.veg,
      status: 1,
      variations: JSON.stringify(this.variations),
      size: this.size,
    };

    console.log('*****', param);

    this.spinner.show();
    this.api.post('products/save', param).then((data: any) => {
      console.log(data);
      this.spinner.hide();
      if (data && data.status === 200) {
        // this.util.showToast('Product added successfully', 'success', 'bottom');
        this.navCtrl.back();
      } else {
        this.error(this.util.translate('Something went wrong'));
      }
    }, error => {
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
      console.log('error', error);
    });
  }
  submit() {
    console.log('size-->>', this.size);
    console.log('submited', this.veg);
    if (this.name === '' || !this.name || this.cid === '' ||
      !this.cid || this.price === '' || !this.price || this.descriptions === '' || !this.descriptions) {
      this.error(this.util.translate('All Fields are required'));
      return false;
    }
    if (!this.coverImage || this.coverImage === '') {
      this.error(this.util.translate('Please add your cover image'));
      return false;
    }
    if (this.isEdit) {
      console.log('create');
      this.update();
    } else {
      console.log('create');
      this.create();
    }
  }

  update() {

    const param = {
      restId: localStorage.getItem('uid'),
      cid: this.cid,
      name: this.name,
      price: this.price,
      details: this.descriptions,
      cover: this.coverImage,
      veg: this.veg,
      status: this.status,
      variations: JSON.stringify(this.variations),
      size: this.size,
      id: this.id
    };

    console.log('*****', param);

    this.spinner.show();
    this.api.post('products/editList', param).then((data: any) => {
      console.log(data);
      this.spinner.hide();
      if (data && data.status === 200) {

        this.navCtrl.back();
      } else {
        this.error(this.util.translate('Something went wrong'));
      }
    }, error => {
      this.spinner.hide();
      this.error(this.util.translate('Something went wrong'));
      console.log('error', error);
    });
  }

  async addNew() {
    try {
      this.modalService.open(this.newAddone, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log(reason);
      });
    } catch (error) {
      console.log(error);
    }
  }

  addNewAddon() {
    if (this.addonName && this.addonName !== '') {
      const item = {
        title: this.addonName,
        type: this.addonType,
        items: []
      };
      this.variations.push(item);
      this.modalService.dismissAll();
    } else {
      this.error(this.util.translate('All Field are required'));
    }
  }

}
