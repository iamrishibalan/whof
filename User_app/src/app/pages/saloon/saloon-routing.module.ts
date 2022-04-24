import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SaloonPage } from './saloon.page';

const routes: Routes = [
  {
    path: '',
    component: SaloonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SaloonPageRoutingModule {}
