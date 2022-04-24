
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageOffersComponent } from './manage-offers.component';


const routes: Routes = [
  {
    path: '',
    component: ManageOffersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageOffersRoutingModule { }
