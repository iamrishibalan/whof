import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SaloonCategoryPage } from './saloon-category.page';

const routes: Routes = [
  {
    path: '',
    component: SaloonCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SaloonCategoryPageRoutingModule {}
