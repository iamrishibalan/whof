import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddservicePage } from './addservice.page';

const routes: Routes = [
  {
    path: '',
    component: AddservicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddservicePageRoutingModule {}
