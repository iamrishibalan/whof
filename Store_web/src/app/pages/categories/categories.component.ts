import { UtilService } from './../../services/util.service';

import { Component, OnInit, ViewChild } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { Router, NavigationExtras } from '@angular/router';
import * as moment from 'moment';
import { _, orderBy } from 'lodash';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @ViewChild('content', { static: false }) content: any;
  categories: any[] = [];
  dummycates: any[] = [];
  dummy = Array(5);
  page = 1;

  id: any;
  name: any;
  create: boolean;
  constructor(
    public api: ApisService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastyService: ToastyService,
    private modalService: NgbModal,
    public util: UtilService
  ) {
    this.getCategories();
  }

  ngOnInit(): void {
  }

  getCategories() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.categories = [];
    this.dummycates = [];
    this.api.post('categories/getByRestId', param).then((data: any) => {
      this.dummy = [];
      if (data && data.status === 200 && data.data.length) {
        this.categories = data.data;
        this.dummycates = data.data;
      }
    }, error => {
      console.log(error);
      console.log(error);
      this.dummy = [];
      this.error(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      console.log(error);
      this.dummy = [];
      this.error(this.util.translate('Something went wrong'));
    });
  }

  search(string) {
    this.resetChanges();
    console.log('string', string);
    this.categories = this.filterItems(string);
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

  protected resetChanges = () => {
    this.categories = this.dummycates;
  }

  setFilteredItems() {
    console.log('clear');
    this.categories = [];
    this.categories = this.dummycates;
  }

  filterItems(searchTerm) {
    return this.categories.filter((item) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });

  }


  getClass(item) {
    if (item === '1') {
      return 'btn btn-primary btn-round';
    } else if (item === '0') {
      return 'btn btn-danger btn-round';
    }
    return 'btn btn-warning btn-round';
  }

  deleteIt(item) {
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('to delete') + ' ' + item.name + ' ?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: this.util.translate('Delete'),
      backdrop: false,
      background: 'white'
    }).then(status => {
      if (status && status.value) {
        const param = {
          id: item.id,
        };
        this.spinner.show();
        this.api.post('categories/deleteList', param).then((datas: any) => {
          console.log(datas);
          this.spinner.hide();
          if (datas && datas.status === 200) {
            this.getCategories();
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
              onOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });

            Toast.fire({
              icon: 'success',
              title: this.util.translate('deleted')
            });
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
    });
  }
  getDates(date) {
    return moment(date).format('llll');
  }

  getCurrency() {
    return this.api.getCurrecySymbol();
  }

  update(item) {
    console.log(item);
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: 'To change it',
      icon: 'question',
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      backdrop: false,
      background: 'white'
    }).then((data) => {
      if (data && data.value) {
        console.log('update it');
        const param = {
          id: item.id,
          status: item.status === '1' ? 0 : 1
        };
        this.spinner.show();
        this.api.post('categories/editList', param).then((datas) => {
          this.spinner.hide();
          this.getCategories();
        }, error => {
          this.spinner.hide();
          this.error(this.util.translate('Something went wrong'));
          console.log(error);
        }).catch(error => {
          this.spinner.hide();
          console.log(error);
          this.error(this.util.translate('Something went wrong'));
        });
      }
    });
  }

  async createNew() {
    console.log();
    this.create = true;
    try {
      this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log(reason);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async edit(item) {
    console.log(status);
    this.create = false;
    this.id = item.id;
    this.name = item.name;
    try {
      this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log(reason);
      });
    } catch (error) {
      console.log(error);
    }
  }

  close() {
    this.modalService.dismissAll();

    if (this.create === true) {
      console.log('new');
      const param = {
        restId: localStorage.getItem('uid'),
        name: this.name,
        status: 1
      };
      this.spinner.show();
      this.api.post('categories/save', param).then((datas: any) => {
        console.log(datas);
        this.spinner.hide();
        if (datas && datas.status === 200) {
          this.name = '';
          this.getCategories();
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            onOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
          });

          Toast.fire({
            icon: 'success',
            title: this.util.translate('saved')
          });
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
    } else {
      const param = {
        id: this.id,
        name: this.name,
      };
      this.spinner.show();
      this.api.post('categories/editList', param).then((datas: any) => {
        console.log(datas);
        this.spinner.hide();
        if (datas && datas.status === 200) {
          this.name = '';
          this.id = '';
          this.getCategories();
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            onOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
          });

          Toast.fire({
            icon: 'success',
            title: this.util.translate('saved')
          });
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
  }
}
