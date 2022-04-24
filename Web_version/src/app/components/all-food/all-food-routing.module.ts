
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllFoodComponent } from './all-food.component';

const routes: Routes = [
  {
    path: '',
    component: AllFoodComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllFoodRoutingModule { }
