
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageSaloonRoutingModule } from './manage-saloon-routing.module';
import { ManageSaloonComponent } from './manage-saloon.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
  declarations: [ManageSaloonComponent],
  imports: [
    CommonModule,
    ManageSaloonRoutingModule,
    SharedModule,
    GooglePlaceModule
  ]
})
export class ManageSaloonModule { }