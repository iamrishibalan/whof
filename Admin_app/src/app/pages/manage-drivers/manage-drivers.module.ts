
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageDriversRoutingModule } from './manage-drivers-routing.module';
import { ManageDriversComponent } from './manage-drivers.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
  declarations: [ManageDriversComponent],
  imports: [
    CommonModule,
    ManageDriversRoutingModule,
    SharedModule,
    GooglePlaceModule
  ]
})
export class ManageDriversModule { }
