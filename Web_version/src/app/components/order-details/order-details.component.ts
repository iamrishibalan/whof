import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { ModalDirective } from 'angular-bootstrap-md';
declare var google: any;
@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  @ViewChild('tracker') public tracker: ModalDirective;
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  id: any;
  grandTotal: any;
  orders: any[] = [];
  serviceTax: any;
  status: any;
  time: any;
  total: any;
  uid: any;
  address: any;
  restName: any;
  deliveryAddress: any;
  paid: any;
  restPhone: any;
  coupon: boolean = false;
  dicount: any;
  dname: any;
  loaded: boolean;
  restFCM: any;
  driverFCM: any;
  dId: any;
  driverName: any;
  driverMobile: any;
  driverCover: any;
  orderNotes: any = '';



  map: any;



  dName: any = '';
  restAddress: any = '';
  dCover: any = '';
  phone: any = '';
  totalOrders: any[] = [];
  payMethod: any;

  myLat: any;
  myLng: any;
  driverLat: any;
  driverLng: any;
  interval: any;
  constructor(
    private route: ActivatedRoute,
    public api: ApiService,
    private router: Router,
    public util: UtilService,
    private navCtrl: Location
  ) {
    this.loaded = false;
    this.util.subscribeHeader().subscribe((data) => {
      console.log('leaved');
      this.closeInterval();
    });
  }

  closeInterval() {
    this.tracker.hide();
    clearInterval(this.interval);
  }
  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log('data=>', data);
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.getOrder();
      }
    });
  }

  getOrder() {
    const param = {
      id: this.id
    };
    this.api.post('orders/getById', param).then((datas: any) => {
      this.loaded = true;
      console.log(datas);
      if (datas && datas.status === 200 && datas.data.length) {
        const data = datas.data[0];
        this.util.orderDetails = data;
        this.grandTotal = data.grand_total;
        this.serviceTax = data.serviceTax;
        this.orders = JSON.parse(data.orders);
        this.status = data.status;
        this.time = moment(data.time).format('llll');
        this.total = data.total;
        this.paid = data.pay_method;
        this.address = data.str_address;
        this.restName = data.str_name;

        this.coupon = data.applied_coupon === '1' ? true : false;
        this.dicount = data.discount;
        this.restPhone = data.str_mobile;
        this.restFCM = data.str_fcm_token;
        if (data && data.address) {
          const add = JSON.parse(data.address);
          this.deliveryAddress = add.house + ' ' + add.landmark + ' ' + add.address + add.pincode;
          this.myLat = add.lat;
          this.myLng = add.lng;
        }
        if (data && data.did && data.did !== '0') {
          this.dId = data.did;
          this.getDriverInfo();
        }
        this.orderNotes = data.notes;
      } else {
        this.navCtrl.back();
      }
    }, error => {
      console.log('error in orders', error);
      this.loaded = true;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log('error in order', error);
      this.loaded = true;
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });

  }

  async presentAlertConfirm() {
    Swal.fire({
      title: this.util.translate('How was your experience?'),
      text: this.util.translate('Rate ' + this.restName + ' and ' + this.driverName),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      backdrop: false,
      background: 'white'
    }).then((data) => {
      console.log(data);
      if (data && data.value) {
        console.log('ok');
        this.router.navigate(['rate']);
      }
    });
  }
  trackMyOrder() {
    this.tracker.show();
  }
  call() {
    if (this.restPhone) {
      window.open('tel:' + this.restPhone);
    }
  }

  getDriverInfo() {
    const param = {
      id: this.dId
    };
    this.api.post('drivers/getById', param).then((data: any) => {
      console.log('driver info--->>', data);
      if (data && data.status === 200 && data.data.length) {
        const info = data.data[0];
        this.util.orderDetails['driverInfo'] = info;
        console.log('---->>>>>', info);
        this.driverName = info.first_name + ' ' + info.last_name;
        this.driverMobile = info.mobile;
        this.driverCover = info.cover;
        this.driverFCM = info.fcm_token;
        this.driverLat = info.lat;
        this.driverLng = info.lng;
        this.loadMap(parseFloat(this.myLat), parseFloat(this.myLng), parseFloat(this.driverLat), parseFloat(this.driverLng));
      }
    }, error => {
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch((error) => {
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  loadMap(latOri, lngOri, latDest, lngDest) {

    const directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay = new google.maps.DirectionsRenderer();
    const bounds = new google.maps.LatLngBounds;

    const origin1 = { lat: parseFloat(latOri), lng: parseFloat(lngOri) };
    const destinationA = { lat: latDest, lng: lngDest };

    const maps = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: latOri, lng: lngOri },
      disableDefaultUI: true,
      zoom: 100
    });

    const custPos = new google.maps.LatLng(latOri, lngOri);
    const restPos = new google.maps.LatLng(latDest, lngDest);

    const logo = {
      url: 'assets/pin.png',
      scaledSize: new google.maps.Size(50, 50), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    const marker = new google.maps.Marker({
      map: maps,
      position: custPos,
      animation: google.maps.Animation.DROP,
      icon: logo,
    });
    const markerCust = new google.maps.Marker({
      map: maps,
      position: restPos,
      animation: google.maps.Animation.DROP,
      icon: logo,
    });
    marker.setMap(maps);
    markerCust.setMap(maps);

    directionsDisplay.setMap(maps);
    // directionsDisplay.setOptions({ suppressMarkers: true });
    directionsDisplay.setOptions({
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: 1,
        strokeColor: '#ff384c'
      },
      suppressMarkers: true
    });
    const geocoder = new google.maps.Geocoder;

    const service = new google.maps.DistanceMatrixService;

    service.getDistanceMatrix({
      origins: [origin1],
      destinations: [destinationA],
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, function (response, status) {
      if (status !== 'OK') {
        alert('Error was: ' + status);
      } else {
        const originList = response.originAddresses;
        const destinationList = response.destinationAddresses;
        const showGeocodedAddressOnMap = function (asDestination) {
          return function (results, status) {
            if (status === 'OK') {
              maps.fitBounds(bounds.extend(results[0].geometry.location));
            } else {
              alert('Geocode was not successful due to: ' + status);
            }
          };
        };

        directionsService.route({
          origin: origin1,
          destination: destinationA,
          travelMode: 'DRIVING'
        }, function (response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });


        for (let i = 0; i < originList.length; i++) {
          const results = response.rows[i].elements;
          geocoder.geocode({ 'address': originList[i] },
            showGeocodedAddressOnMap(false));
          for (let j = 0; j < results.length; j++) {
            geocoder.geocode({ 'address': destinationList[j] },
              showGeocodedAddressOnMap(true));
          }
        }
      }
    });
    this.interval = setInterval(() => {
      this.changeMarkerPosition(marker, maps);
    }, 12000);
  }

  changeMarkerPosition(marker, map) {
    const param = {
      id: this.dId
    };
    this.api.post('drivers/getById', param).then((data: any) => {
      console.log('driver info--->>', data);
      if (data && data.status === 200 && data.data.length) {
        const info = data.data[0];
        console.log('---->>>>>', info);
        this.dName = info.first_name + ' ' + info.last_name;
        this.dCover = info.cover;
        this.phone = info.mobile;
        this.driverLat = info.lat;
        this.driverLng = info.lng;
        const latlng = new google.maps.LatLng(parseFloat(this.driverLat), parseFloat(this.driverLng));
        map.setCenter(latlng);
        marker.setPosition(latlng);
      }
    }, error => {
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch((error) => {
      console.log(error);
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });

  }

  driverCall() {
    if (this.driverMobile) {
      window.open('tel:' + this.driverMobile);
    } else {
      this.util.errorMessage(this.util.translate('Number not found'));
    }
  }

  chat() {
    const param: NavigationExtras = {
      queryParams: {
        id: 0,
        name: 'Support',
        uid: localStorage.getItem('uid')
      }
    };
    this.router.navigate(['inbox'], param);
  }

  changeStatus() {
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To Cancel this order'),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      backdrop: false,
      background: 'white'
    }).then((data) => {
      console.log(data);
      if (data && data.value) {
        console.log('Cancel,delivered');
        const value = 'cancel';
        const param = {
          id: this.id,
          status: value,
        };
        console.log('order param', param);
        this.util.start();
        this.api.post('orders/editList', param).then((order) => {
          console.log(order);
          if (order && order.status === 200) {
            if (this.dId && this.dId !== '' && this.dId !== '0') {
              const driverParam = {
                id: this.dId,
                current: 'active'
              };
              console.log('driver param', driverParam);
              this.api.post('drivers/edit_profile', driverParam).then((driver) => {
                if (driver && driver.status === 200) {
                  this.util.stop();
                  this.api.sendNotification(this.util.translate('Order statuts changed'),
                    this.util.translate('Order statuts changed'), this.driverFCM);
                  Swal.fire({
                    title: this.util.translate('success'),
                    text: this.util.translate('Order status changed to ') + value,
                    icon: 'success',
                    timer: 2000,
                    backdrop: false,
                    background: 'white'
                  });
                  this.navCtrl.back();
                } else {
                  this.util.stop();
                  this.util.errorMessage(this.util.translate('Something went wrong'));
                  this.navCtrl.back();
                }
              }, error => {
                console.log(error);
                this.util.stop();
                this.util.errorMessage(this.util.translate('Something went wrong'));
              }).catch(error => {
                console.log(error);
                this.util.stop();
                this.util.errorMessage(this.util.translate('Something went wrong'));
              });
            } else {
              this.util.stop();
              this.navCtrl.back();
            }
            // edit_profile
          } else {
            this.util.stop();
            this.util.errorMessage(this.util.translate('Something went wrong'));
            this.navCtrl.back();
          }
        }, error => {
          console.log(error);
          this.util.stop();
          this.util.errorMessage(this.util.translate('Something went wrong'));
        }).catch(error => {
          console.log(error);
          this.util.stop();
          this.util.errorMessage(this.util.translate('Something went wrong'));
        });
      }
    });
  }

  callDriver() {
    window.open('https://api.whatsapp.com/send?phone=91' + this.phone);
  }

}
