
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApisService } from 'src/app/services/apis.service';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import * as moment from 'moment';

@Component({
  selector: 'app-saloon',
  templateUrl: './saloon.component.html',
  styleUrls: ['./saloon.component.scss']
})
export class SaloonComponent implements OnInit {
  searchText: any = '';
  stores: any[] = [];
  dummyStores: any[] = [];
  dummy = Array(5);
  page: number = 1;
  constructor(
    public api: ApisService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastyService: ToastyService,
  ) {
    this.api.auth();
    this.getCategory();
  }
  filterItems(searchTerm) {
    return this.stores.filter((item) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });

  }
  protected resetChanges = () => {
    this.stores = this.dummyStores;
  }

  setFilteredItems() {
    console.log('clear');
    this.stores = [];
    this.stores = this.dummyStores;
  }
  search(string) {
    this.resetChanges();
    console.log('string', string);
    this.stores = this.filterItems(string);
  }
  ngOnInit(): void {
  }
  getCategory() {
    this.stores = [];
    this.dummy = Array(10);
    this.api.get('stores').then((datas: any) => {
      console.log(datas);
      this.dummy = [];
      if (datas && datas.data.length) {
        datas.data.forEach(element => {
          if (element.cusine && element.cusine !== '') {
            element.cusine = JSON.parse(element.cusine);
          } else {
            element.cusine = [];
          }
        });
        this.stores = datas.data.filter(x => x.dish == '5000');
        this.dummyStores = this.stores;
        
      }
    }, error => {
      console.log(error);
      this.error(this.api.translate('Something went wrong'));
      this.dummy = [];
    }).catch(error => {
      console.log(error);
      this.error(this.api.translate('Something went wrong'));
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

  openRest(item) {
    const navData: NavigationExtras = {
      queryParams: {
        id: item.id,
        register: false
      }
    };
    this.router.navigate(['manage-saloon'], navData);
  }

  changeStatus(item) {
    console.log(item);
    const text = item.status === '1' ? 'Deactivate' : 'Activate';
    Swal.fire({
      title: this.api.translate('Are you sure?'),
      text: this.api.translate(`You can change it later`),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.api.translate('Yes, ') + text + this.api.translate(' it!')
    }).then((result) => {
      if (result.value) {
        const query = item.status === '1' ? '0' : '1';
        const param = {
          id: item.id,
          status: query
        };
        console.log('param', param);
        this.spinner.show();
        this.api.post('stores/editList', param).then((datas: any) => {
          console.log(datas);
          this.spinner.hide();
          if (datas && datas.status === 200) {
            this.getCategory();
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
  
  createNew() {
    const navData: NavigationExtras = {
      queryParams: {
        register: true
      }
    };
    this.router.navigate(['manage-saloon'], navData);
  }
  getTime(time) {
    return moment('2020-12-05 ' + time).format('hh:mm a');
  }
}
