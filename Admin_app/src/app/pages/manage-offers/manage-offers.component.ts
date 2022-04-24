import { ActivatedRoute } from '@angular/router';

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import { ApisService } from 'src/app/services/apis.service';

@Component({
  selector: 'app-manage-offers',
  templateUrl: './manage-offers.component.html',
  styleUrls: ['./manage-offers.component.scss']
})
export class ManageOffersComponent implements OnInit {
  name: any;
  off: any;
  type: any;
  min: any;
  date_time: any;
  descriptions: any;
  upto: any;
  status: any;

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  constructor(
    public api: ApisService,
    private toastyService: ToastyService,
    private spinner: NgxSpinnerService,
    private navCtrl: Location,
    private route: ActivatedRoute,
    private chMod: ChangeDetectorRef
  ) {
    this.api.auth();
  }

  ngOnInit(): void {
    this.api.get('stores').then((data) => {
      console.log('rest data', data);
      console.log(data.data.length);
      if (data && data.data.length) {
        data = data.data.filter(x => x.status === '1');
        console.log('000000', data);
        this.dropdownList = data;
        this.dropdownSettings = {
          singleSelection: false,
          idField: 'id',
          textField: 'name',
          selectAllText: 'Select All',
          unSelectAllText: 'UnSelect All',
          allowSearchFilter: true
        };
        this.chMod.detectChanges();
        console.log(this.dropdownList);
      }
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }


  create() {
    console.log(this.selectedItems);
    const storeId = [...new Set(this.selectedItems.map(item => item.id))];
    console.log(storeId)
    if (!this.name || this.name === '' || !this.off || this.off === '' || !this.type || this.type === '' || !this.min || this.min === '' ||
      !this.date_time || this.date_time === '' || !this.descriptions || this.descriptions === '' || !this.upto || this.upto === '') {
      this.error('All Fields are required');
      return false;
    }
    if (storeId.length === 0) {
      this.error('Please select restaurant');
      return false;
    }

    const param = {
      code: this.name,
      discount: this.off,
      type: this.type,
      min: this.min,
      expire: this.date_time,
      details: this.descriptions,
      status: 1,
      upto: this.upto,
      available: storeId.join(',')
    };

    this.spinner.show();
    this.api.post('offers/save', param).then((data: any) => {
      console.log(data);
      this.spinner.hide();
      if (data && data.status === 200) {
        this.navCtrl.back();
      } else {
        this.error('Something went wrong');
      }
    }).catch(error => {
      console.log(error);
      this.spinner.hide();
      this.error('Something went wrong');
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

  onItemSelect(item: any) {
    console.log(item, this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items, this.selectedItems);
  }
  getList() {
    return this.dropdownList;
  }

}
