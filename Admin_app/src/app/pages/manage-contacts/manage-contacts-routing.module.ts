
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageContactsComponent } from './manage-contacts.component';


const routes: Routes = [
  {
    path: '',
    component: ManageContactsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageContactsRoutingModule { }
