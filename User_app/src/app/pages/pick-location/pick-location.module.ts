
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickLocationPageRoutingModule } from './pick-location-routing.module';

import { PickLocationPage } from './pick-location.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickLocationPageRoutingModule,

  ],
  declarations: [PickLocationPage]
})
export class PickLocationPageModule { }
