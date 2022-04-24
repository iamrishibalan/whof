
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RateRoutingModule } from './rate-routing.module';
import { RateComponent } from './rate.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

@NgModule({
  declarations: [RateComponent],
  imports: [
    CommonModule,
    RateRoutingModule,
    MDBBootstrapModule.forRoot(),
    NgxSpinnerModule,
    FormsModule,
  ]
})
export class RateModule { }
