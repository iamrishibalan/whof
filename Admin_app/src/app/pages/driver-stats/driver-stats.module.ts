
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverStatsRoutingModule } from './driver-stats-routing.module';
import { DriverStatsComponent } from './driver-stats.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPrintModule } from 'ngx-print';


@NgModule({
  declarations: [DriverStatsComponent],
  imports: [
    CommonModule,
    DriverStatsRoutingModule,
    SharedModule,
    NgxPrintModule,
  ]
})
export class DriverStatsModule { }
