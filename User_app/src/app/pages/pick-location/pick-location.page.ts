
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Router } from '@angular/router';
import { Platform, AlertController, NavController, MenuController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
declare var google;
@Component({
  selector: 'app-pick-location',
  templateUrl: './pick-location.page.html',
  styleUrls: ['./pick-location.page.scss'],
})
export class PickLocationPage implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  autocomplete1: { 'query': string };
  autocompleteItems1: any = [];
  GoogleAutocomplete;
  geocoder: any;
  map: any;
  addr: any;
  lat: any;
  lng: any;
  previousMarker: any;
  constructor(
    private chMod: ChangeDetectorRef,
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    public geolocation: Geolocation,
    private router: Router,
    public util: UtilService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private menuController: MenuController,
    private diagnostic: Diagnostic,
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
    this.autocomplete1 = { query: '' };
    this.autocompleteItems1 = [];
  }

  loadMap(lat, lng) {
    this.lat = lat;
    this.lng = lng;
    const latLng = new google.maps.LatLng(lat, lng);
    const mapOptions = {
      center: latLng,
      zoom: 15,
      scaleControl: true,
      streetViewControl: false,
      zoomControl: false,
      overviewMapControl: false,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      disableDoubleClickZoom: false,
      styles: [],
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.previousMarker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      animation: google.maps.Animation.DROP,
      title: 'Your Location',
    });
  }

  ngOnInit() {
  }

  close() {
    this.navCtrl.back();
  }

  getLocation() {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
          result => console.log('Has permission?', result.hasPermission),
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
        );
        this.grantRequest();
      } else if (this.platform.is('ios')) {
        this.grantRequest();
      } else {
        this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 10000, enableHighAccuracy: false }).then((resp) => {
          if (resp) {
            console.log('resp', resp);
            this.lat = resp.coords.latitude;
            this.lng = resp.coords.longitude;
            this.getAddress(this.lat, this.lng);
          }
        }).catch(error => {
          console.log(error);
          this.grantRequest();
        });
      }
    });
  }

  askPermission() {
    this.getLocation();
  }

  grantRequest() {
    this.diagnostic.isLocationEnabled().then((data) => {
      if (data) {
        this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 10000, enableHighAccuracy: false }).then((resp) => {
          if (resp) {
            console.log('resp', resp);
            this.lat = resp.coords.latitude;
            this.lng = resp.coords.longitude;
            this.getAddress(resp.coords.latitude, resp.coords.longitude);
          }
        }).catch(error => {
          console.log('ERORROR 1 and open', JSON.stringify(error));
          this.diagnostic.switchToSettings();
        });
      } else {
        this.diagnostic.switchToSettings();
        this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 10000, enableHighAccuracy: false }).then((resp) => {
          if (resp) {
            console.log('ress,', resp);
            this.lat = resp.coords.latitude;
            this.lng = resp.coords.longitude;
            this.getAddress(resp.coords.latitude, resp.coords.longitude);
          }
        }).catch(error => {
          console.log('ERORROR 1 and open', JSON.stringify(error));
          this.diagnostic.switchToSettings();
        });
      }
    }, error => {
      console.log('errir ????????????????/', error);
      if (this.platform.is('ios')) {
        this.iOSAlert();
      } else {
        this.presentAlertConfirm();
      }
    }).catch(error => {
      console.log('error ******************', error);
      if (this.platform.is('ios')) {
        this.iOSAlert();
      } else {
        this.presentAlertConfirm();
      }
    });

  }

  getAddress(lat, lng) {

    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(lat, lng);
    geocoder.geocode({ 'location': location }, (results, status) => {
      console.log(results);
      console.log('status', status);
      if (results && results.length) {
        this.lat = lat;
        this.lng = lng;
        localStorage.setItem('location', 'true');
        localStorage.setItem('lat', this.lat);
        localStorage.setItem('address', results[0].formatted_address);
        localStorage.setItem('lng', this.lng);
        this.util.cityAddress = results[0].formatted_address;
        this.util.publishLocation();
        this.navCtrl.navigateRoot(['']);
      } else {
        this.util.errorToast('Something went wrong please try again later');
      }
    });
  }

  async iOSAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'Please Enable Location Service for best experience',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            this.diagnostic.switchToSettings();
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'Please Enable Location Service for best experience',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            this.askPermission();
          }
        }
      ]
    });

    await alert.present();
  }

  selectedAddress() {
    localStorage.setItem('location', 'true');
    localStorage.setItem('lat', this.lat);
    localStorage.setItem('lng', this.lng);
    localStorage.setItem('address', this.autocomplete1.query);
    this.util.publishLocation();
    this.navCtrl.navigateRoot(['']);
  }

  async onSearchChange(event) {
    if (this.autocomplete1.query === '') {
      this.autocompleteItems1 = [];
      return;
    }
    const addsSelected = localStorage.getItem('addsSelected');
    if (addsSelected && addsSelected != null) {
      localStorage.removeItem('addsSelected');
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete1.query }, (predictions, status) => {
      console.log(predictions);
      if (predictions && predictions.length > 0) {
        this.autocompleteItems1 = predictions;
        console.log(this.autocompleteItems1);
      }
    });
  }

  selectSearchResult1(item) {
    console.log('select', item);
    localStorage.setItem('addsSelected', 'true');
    this.autocompleteItems1 = [];
    this.autocomplete1.query = item.description;
    this.util.cityAddress = item.description;
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        console.log(status);
        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();
        console.log(this.lat, this.lng);
        this.chMod.detectChanges();
        this.loadMap(this.lat, this.lng);
      }
    });
  }

  ionViewWillEnter() {
    this.menuController.enable(false);
  }
  ionViewWillLeave() {
    this.menuController.enable(true);
  }
}
