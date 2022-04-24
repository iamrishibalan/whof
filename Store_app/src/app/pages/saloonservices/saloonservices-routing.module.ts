import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SaloonservicesPage } from './saloonservices.page';

const routes: Routes = [
  {
    path: '',
    component: SaloonservicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SaloonservicesPageRoutingModule {}
