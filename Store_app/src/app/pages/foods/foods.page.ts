
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.page.html',
  styleUrls: ['./foods.page.scss'],
})
export class FoodsPage implements OnInit {

  foods: any[] = [];
  dummy = Array(10);
  categories: any[] = [];
  caetId: any;
  terms: any;
  constructor(
    private router: Router,
    public api: ApisService,
    public util: UtilService
  ) {

  }

  ngOnInit() {
  }

  category() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post('categories/getByRestId', param).then((data: any) => {
      if (data && data.status === 200 && data.data.length) {
        this.categories = data.data;
        this.caetId = this.categories[0].id;
        this.getFoodByCid();
      } else {
        this.dummy = [];
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  ionViewWillEnter() {
    this.category();
  }

  segmentChanged() {
    this.foods = [];
    this.dummy = Array(10);
    this.getFoodByCid();
  }

  getFoods() {
    const param = {
      id: localStorage.getItem('uid'),
      limit: 5000
    };
    this.api.post('products/getByStoreId', param).then((data: any) => {
      this.dummy = [];
      console.log(data);
      console.log(data && data.status === 200 && data.data.length > 0);
      if (data && data.status === 200 && data.data.length > 0) {
        this.foods = data.data;
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  getFoodByCid() {
    const param = {
      id: localStorage.getItem('uid'),
      cid: this.caetId
    };

    this.api.post('products/getFoodByCid', param).then((data: any) => {
      this.dummy = [];
      console.log(data);
      console.log(data && data.status === 200 && data.data.length > 0);
      if (data && data.status === 200 && data.data.length > 0) {
        this.foods = data.data;
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }
  addnew() {
    this.router.navigate(['/add-new-foods']);
  }

  foodsInfo(item) {
    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        id: item.id
      }
    };
    this.router.navigate(['add-new-foods'], navData);
  }

  search(event) {
    console.log(event);
    const param = {
      search: event,
      id: localStorage.getItem('uid')
    };
    this.foods = [];
    this.dummy = Array(10);
    this.api.post('products/getSearchItems', param).then((data) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status === 200 && data.data.length > 0) {
        this.foods = data.data;
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  onSearchChange(event) {
    if (event.detail.value) {
    } else {
      this.category();
    }
  }
}
