
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CookieComponent } from './cookie.component';

const routes: Routes = [
  {
    path: '',
    component: CookieComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CookieRoutingModule { }
