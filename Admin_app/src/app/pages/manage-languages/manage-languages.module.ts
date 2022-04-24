
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageLanguagesRoutingModule } from './manage-languages-routing.module';
import { ManageLanguagesComponent } from './manage-languages.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [ManageLanguagesComponent],
  imports: [
    CommonModule,
    ManageLanguagesRoutingModule,
    SharedModule
  ]
})
export class ManageLanguagesModule { }
