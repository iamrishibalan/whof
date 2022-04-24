
import { BrowserModule } from '@angular/platform-browser';

import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { UsersComponent } from './layouts/users/users.component';
import { AdminsComponent } from './layouts/admins/admins.component';
import { ErrorsComponent } from './layouts/errors/errors.component';
import { HeadersComponent } from './shared/headers/headers.component';
import { FootersComponent } from './shared/footers/footers.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { SharedModule } from './shared/shared.module';
import { MobileHeaderComponent } from './shared/mobile-header/mobile-header.component';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { LeaveGuard } from './leaved/leaved.guard';
@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    AdminsComponent,
    ErrorsComponent,
    HeadersComponent,
    FootersComponent,
    MobileHeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgOtpInputModule,
    NgxUiLoaderModule,
    NgxSkeletonLoaderModule,
    SharedModule,
    IvyCarouselModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [LeaveGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
