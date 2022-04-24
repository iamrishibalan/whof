import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SaloonCategoryPageRoutingModule } from './saloon-category-routing.module';

import { SaloonCategoryPage } from './saloon-category.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SaloonCategoryPageRoutingModule
  ],
  declarations: [SaloonCategoryPage]
})
export class SaloonCategoryPageModule {}
