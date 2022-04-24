
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageBannersRoutingModule } from './manage-banners-routing.module';
import { ManageBannersComponent } from './manage-banners.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ManageBannersComponent],
  imports: [
    CommonModule,
    ManageBannersRoutingModule,
    SharedModule,
  ]
})
export class ManageBannersModule { }
