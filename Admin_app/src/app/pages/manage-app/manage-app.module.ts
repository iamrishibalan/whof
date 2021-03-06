
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageAppRoutingModule } from './manage-app-routing.module';
import { ManageAppComponent } from './manage-app.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [ManageAppComponent],
  imports: [
    CommonModule,
    ManageAppRoutingModule,
    SharedModule
  ]
})
export class ManageAppModule { }
