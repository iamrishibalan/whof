
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaloonRoutingModule } from './saloon-routing.module';
import { SaloonComponent } from './saloon.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [SaloonComponent],
  imports: [
    CommonModule,
    SaloonRoutingModule,
    SharedModule
  ]
})
export class SaloonModule { }
