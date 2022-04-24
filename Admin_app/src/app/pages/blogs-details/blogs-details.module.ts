
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogsDetailsRoutingModule } from './blogs-details-routing.module';
import { BlogsDetailsComponent } from './blogs-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CKEditorModule } from 'ng2-ckeditor';


@NgModule({
  declarations: [BlogsDetailsComponent],
  imports: [
    CommonModule,
    BlogsDetailsRoutingModule,
    SharedModule,
    CKEditorModule
  ]
})
export class BlogsDetailsModule { }
