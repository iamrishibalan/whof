
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-variations',
  templateUrl: './variations.page.html',
  styleUrls: ['./variations.page.scss'],
})
export class VariationsPage implements OnInit {
  productName: any = '';
  desc: any = '';
  total: any = 0;
  lists: any;
  cart: any[] = [];
  userCart: any[] = [];

  sameProduct: boolean = false;
  removeProduct: boolean = false;

  radioSelected: any;
  haveSize: boolean;


  newItem: boolean = false;

  sameCart: any[] = [];
  currentFile: any[] = [];

  selectedItem: any;
  foodInfo: any;
  constructor(
    private modalController: ModalController,
    private navParma: NavParams,
    public util: UtilService
  ) {
    const info = this.navParma.get('food');
    this.foodInfo = info;
    this.selectedItem = info;
    console.log('info', info);
    this.productName = info.name;
    this.lists = info.variations;
    const userCart = localStorage.getItem('userCart');
    this.haveSize = info.size === '1';
    if (userCart && userCart !== 'null' && userCart !== undefined && userCart !== 'undefined') {
      this.userCart = JSON.parse(userCart);
      const sameItem = this.userCart.filter(x => x.id === info.id);
      if (sameItem.length > 0) {
        this.sameProduct = true;
        this.sameCart = sameItem[0].selectedItem;
        this.currentFile.push(sameItem[0]);
      }
    } else {
      this.userCart = [];
    }
  }

  ngOnInit() {
  }
  closeIt() {
    this.modalController.dismiss();
  }

  radioGroupChange(event, title) {
    console.log(this.lists);
    const radioList = this.lists.filter(x => x.title === title);
    const selectedItems = radioList[0].items.filter(x => x.title === event.detail.value);
    const price = parseFloat(selectedItems[0].price);
    const param = {
      type: title,
      value: price,
      name: selectedItems[0].title
    };
    const item = this.cart.filter(x => x.type === title);
    if (item && item.length) {
      const index = this.cart.findIndex(x => x.type === title);
      this.cart[index].value = price;
      this.cart[index].name = selectedItems[0].title;
    } else {
      this.cart.push(param);
    }
  }


  sameChoise() {
    this.modalController.dismiss(this.sameCart, 'sameChoice');
  }
  addToCart() {
    /*
      new
      sameChoice
      newCustom
      remove
      dismissed with no selection from extras.
    */
    const addedSize = this.cart.filter(x => x.type === 'size');
    let role;
    if (this.haveSize && !addedSize.length) {
      this.util.errorToast('Please select size');
      return false;
    }
    if (this.cart.length && !this.userCart.length) {
      role = 'new';
    }
    if (this.cart.length && this.userCart.length) {
      role = 'new';
    }
    if (!this.cart.length) {
      role = 'dismissed';
    }
    if (this.newItem) {
      role = 'newCustom';
    }
    console.log(this.haveSize, '------------------', this.cart);
    if (this.haveSize === false) {
      const regularItem =
      {
        name: 'Regular',
        type: 'size',
        value: Number(this.foodInfo.price)
      };
      this.cart.push(regularItem);
    }
    this.modalController.dismiss(this.cart, role);
  }

  checkedEvent(event, title) {
    const price = parseFloat(event.detail.value);
    const param = {
      type: title,
      value: price,
      name: title
    };
    if (event.detail && event.detail.checked) {
      this.cart.push(param);
    } else {
      this.cart = this.cart.filter(x => x.type !== title);
    }
  }

  addQ(index) {
    this.sameCart[index].total = this.sameCart[index].total + 1;
  }

  removeQ(index) {
    this.sameCart[index].total = this.sameCart[index].total - 1;
    if (this.sameCart[index].total === 0) {
      this.sameCart = this.sameCart.filter(x => x.total !== 0);
    }

    if (this.sameCart.length < 0) {
      this.modalController.dismiss(this.cart, 'remove');
    }
  }


}
