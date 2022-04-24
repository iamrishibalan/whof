import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SaloonservicesPageRoutingModule } from './saloonservices-routing.module';

import { SaloonservicesPage } from './saloonservices.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SaloonservicesPageRoutingModule
  ],
  declarations: [SaloonservicesPage]
})
export class SaloonservicesPageModule {}
