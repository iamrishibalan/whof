
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoticeRoutingModule } from './notice-routing.module';
import { NoticeComponent } from './notice.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [NoticeComponent],
  imports: [
    CommonModule,
    NoticeRoutingModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    NgxSpinnerModule,
    SharedModule
  ]
})
export class NoticeModule { }
