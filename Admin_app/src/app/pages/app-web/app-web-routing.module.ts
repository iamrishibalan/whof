
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppWebComponent } from './app-web.component';


const routes: Routes = [
  {
    path: '',
    component: AppWebComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppWebRoutingModule { }
