
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppPagesRoutingModule } from './app-pages-routing.module';
import { AppPagesComponent } from './app-pages.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [AppPagesComponent],
  imports: [
    CommonModule,
    AppPagesRoutingModule,
    SharedModule
  ]
})
export class AppPagesModule { }
