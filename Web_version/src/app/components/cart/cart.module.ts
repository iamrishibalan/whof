
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './cart.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { CreditCardDirectivesModule } from 'angular-cc-library';
import { NgxPayPalModule } from 'ngx-paypal';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [CartComponent],
  imports: [
    CommonModule,
    CartRoutingModule,
    MDBBootstrapModule.forRoot(),
    NgxSpinnerModule,
    FormsModule,
    NgxPayPalModule,
    CreditCardDirectivesModule,
    SharedModule
  ]
})
export class CartModule { }
