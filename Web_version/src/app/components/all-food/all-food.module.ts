
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllFoodRoutingModule } from './all-food-routing.module';
import { AllFoodComponent } from './all-food.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgOtpInputModule } from 'ng-otp-input';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [AllFoodComponent],
  imports: [
    CommonModule,
    AllFoodRoutingModule,
    MDBBootstrapModule.forRoot(),
    NgxSpinnerModule,
    NgOtpInputModule,
    FormsModule,
    SharedModule
  ]
})
export class AllFoodModule { }
