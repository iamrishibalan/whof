
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickLocationPage } from './pick-location.page';

const routes: Routes = [
  {
    path: '',
    component: PickLocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickLocationPageRoutingModule { }
