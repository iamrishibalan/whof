import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddservicePageRoutingModule } from './addservice-routing.module';

import { AddservicePage } from './addservice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddservicePageRoutingModule
  ],
  declarations: [AddservicePage]
})
export class AddservicePageModule {}
