
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageStoresRoutingModule } from './manage-stores-routing.module';
import { ManageStoresComponent } from './manage-stores.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
  declarations: [ManageStoresComponent],
  imports: [
    CommonModule,
    ManageStoresRoutingModule,
    SharedModule,
    GooglePlaceModule
  ]
})
export class ManageStoresModule { }
