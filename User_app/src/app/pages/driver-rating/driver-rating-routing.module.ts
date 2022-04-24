

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverRatingPage } from './driver-rating.page';

const routes: Routes = [
  {
    path: '',
    component: DriverRatingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverRatingPageRoutingModule { }
