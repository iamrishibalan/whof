import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SaloonPageRoutingModule } from './saloon-routing.module';

import { SaloonPage } from './saloon.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SaloonPageRoutingModule
  ],
  declarations: [SaloonPage]
})
export class SaloonPageModule {}
