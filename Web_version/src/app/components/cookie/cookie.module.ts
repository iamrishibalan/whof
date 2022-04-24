
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CookieRoutingModule } from './cookie-routing.module';
import { CookieComponent } from './cookie.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [CookieComponent],
  imports: [
    CommonModule,
    CookieRoutingModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    NgxSpinnerModule,
    SharedModule
  ]
})
export class CookieModule { }
