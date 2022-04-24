
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import Swal from 'sweetalert2';
import { CartService } from 'src/app/services/cart.service';
@Component({
  selector: 'app-choose-address',
  templateUrl: './choose-address.page.html',
  styleUrls: ['./choose-address.page.scss'],
})
export class ChooseAddressPage implements OnInit {
  id: any;
  myaddress: any[] = [];
  from: any;
  selectedAddress: any;
  dummy = Array(10);

  constructor(
    private router: Router,
    public api: ApisService,
    public util: UtilService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private popoverController: PopoverController,
    private cart: CartService
  ) {
    console.log('notes', this.cart.orderNotes);
    this.route.queryParams.subscribe(data => {
      console.log(data);
      if (data && data.from) {
        this.from = data.from;
      }
    });
    this.getAddress();
    this.util.getObservable().subscribe((data) => {
      this.getAddress();
    });
  }

  ngOnInit() {

  }

  getAddress() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post('address/getByUid', param).then((data) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status === 200 && data.data.length > 0) {
        this.myaddress = data.data;
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


  addNew() {
    this.router.navigate(['add-new-address']);
  }

  async selectAddress() {
    if (this.from === 'cart') {
      console.log(this.util.general);
      console.log(this.cart.cartStoreInfo);
      const selected = this.myaddress.filter(x => x.id === this.selectedAddress);
      if (selected && selected.length && this.cart.cartStoreInfo && this.cart.cartStoreInfo.lat) {
        const item = selected[0];
        const distance = await this.distanceInKmBetweenEarthCoordinates(parseFloat(this.cart.cartStoreInfo.lat),
          parseFloat(this.cart.cartStoreInfo.lng), parseFloat(item.lat), parseFloat(item.lng));
        console.log('distance', distance);
        const permittedDistance = parseInt(this.util.general.allowDistance);
        console.log('--', permittedDistance);
        if (distance <= permittedDistance) {
          console.log('distance is ok... you can order now');
          this.cart.deliveryAddress = item;
          this.cart.calcuate();
          this.router.navigate(['payments']);
        } else {
          this.util.errorToast('Distance between your address and restaurant address must be  ' + permittedDistance + ' KM');
        }
      }
      // const address = {
      //   address: item.house + ' ' + item.landmark + ' ' + item.address,
      //   lat: item.lat,
      //   lng: item.lng,
      //   id: item.id
      // };
      // localStorage.setItem('deliveryAddress', JSON.stringify(address));
      // // this.util.showToast('Address changed', 'success', 'bottom');
      // // this.navCtrl.back();

      // this.router.navigate(['payments']);
    }
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    console.log(lat1, lon1, lat2, lon2);
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  async openMenu(item, events) {

    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: events,
      mode: 'ios',
    });
    popover.onDidDismiss().then(data => {
      console.log(data.data);
      if (data && data.data) {
        if (data.data === 'edit') {
          const navData: NavigationExtras = {
            queryParams: {
              from: 'edit',
              data: JSON.stringify(item)
            }
          };
          this.router.navigate(['add-new-address'], navData);
        } else if (data.data === 'delete') {
          console.log(item);
          Swal.fire({
            title: this.util.translate('Are you sure?'),
            text: this.util.translate('to delete this address'),
            icon: 'question',
            confirmButtonText: this.util.translate('Yes'),
            backdrop: false,
            background: 'white',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: this.util.translate('cancel')
          }).then(data => {
            console.log(data);
            if (data && data.value) {
              this.util.show();
              const param = {
                id: item.id
              };
              this.api.post('address/deleteList', param).then(info => {
                console.log(info);
                this.util.hide();
                this.getAddress();
              }, error => {
                console.log(error);
                this.util.hide();
                this.util.errorToast(this.util.translate('Something went wrong'));
              }).catch((error) => {
                console.log(error);
                this.util.hide();
                this.util.errorToast(this.util.translate('Something went wrong'));
              });
            }
          });

        }
      }
    });
    await popover.present();
  }
}
