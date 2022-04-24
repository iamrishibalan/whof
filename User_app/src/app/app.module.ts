
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ChooseAddressPageModule } from 'src/app/pages/choose-address/choose-address.module';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Camera } from '@ionic-native/camera/ngx';
import { SelectDriversPageModule } from './pages/select-drivers/select-drivers.module';
import { HTTP } from '@ionic-native/http/ngx';
import { VariationsPageModule } from './pages/variations/variations.module';
import { IonicStorageModule } from '@ionic/storage';
import { VerifyPageModule } from './pages/verify/verify.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ProductRatingPageModule } from './pages/product-rating/product-rating.module';
import { DriverRatingPageModule } from './pages/driver-rating/driver-rating.module';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { SelectCountryPageModule } from './pages/select-country/select-country.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ChooseAddressPageModule,
    HttpClientModule,
    SelectDriversPageModule,
    VariationsPageModule,
    VerifyPageModule,
    ProductRatingPageModule,
    DriverRatingPageModule,
    SelectCountryPageModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AndroidPermissions,
    Geolocation,
    OneSignal,
    Camera,
    HTTP,
    InAppBrowser,
    Diagnostic,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
