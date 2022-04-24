
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageBannersComponent } from './manage-banners.component';


const routes: Routes = [
  {
    path: '',
    component: ManageBannersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageBannersRoutingModule { }
