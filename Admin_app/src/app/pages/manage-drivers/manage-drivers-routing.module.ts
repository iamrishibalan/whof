
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageDriversComponent } from './manage-drivers.component';


const routes: Routes = [
  {
    path: '',
    component: ManageDriversComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageDriversRoutingModule { }
