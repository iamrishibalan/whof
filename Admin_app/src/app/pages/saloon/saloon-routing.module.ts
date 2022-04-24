
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SaloonComponent } from './saloon.component';


const routes: Routes = [
  {
    path: '',
    component: SaloonComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaloonRoutingModule { }