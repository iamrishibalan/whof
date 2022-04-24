
import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate, PreloadAllModules } from '@angular/router';
import { UsersComponent } from './layouts/users/users.component';
import { ErrorsComponent } from './layouts/errors/errors.component';
import { AuthGuard } from './guard/auth.guard';
import { LocationGuard } from './locationGuard/location.guard';
import { LeaveGuard } from './leaved/leaved.guard';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: '',
        redirectTo: 'restaurants',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () => import('./components/home/home.module').then(m => m.HomeModule),
        data: { title: 'Home' }
      },
      {
        path: 'about',
        loadChildren: () => import('./components/about/about.module').then(m => m.AboutModule),
        data: { title: 'About' }
      },
      {
        path: 'contact',
        loadChildren: () => import('./components/contact/contact.module').then(m => m.ContactModule),
        data: { title: 'Contact' }
      },
      {
        path: 'restaurants',
        loadChildren: () => import('./components/restaurants/restaurants.module').then(m => m.RestaurantsModule),
        canActivate: [LocationGuard],
        data: { title: 'Restaurants' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'faq',
        loadChildren: () => import('./components/faq/faq.module').then(m => m.FaqModule),
        data: { title: 'Faqs' }
      },
      {
        path: 'help',
        loadChildren: () => import('./components/help/help.module').then(m => m.HelpModule),
        data: { title: 'Help' }
      },
      {
        path: 'order/:id/:name',
        loadChildren: () => import('./components/all-food/all-food.module').then(m => m.AllFoodModule),
        data: { title: 'Restaurants details' }
      },
      {
        path: 'cart',
        loadChildren: () => import('./components/cart/cart.module').then(m => m.CartModule),
        canActivate: [AuthGuard],
        data: { title: 'Cart' }
      },
      {
        path: 'orders',
        loadChildren: () => import('./components/orders/orders.module').then(m => m.OrdersModule),
        data: { title: 'Orders' }
      },
      {
        path: 'order-details',
        loadChildren: () => import('./components/order-details/order-details.module').then(m => m.OrderDetailsModule),
        data: { title: 'Orders Details' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'rate',
        loadChildren: () => import('./components/rate/rate.module').then(m => m.RateModule),
        data: { title: 'Rate' }
      },
      {
        path: 'user/:id/:from',
        loadChildren: () => import('./components/settings/settings.module').then(m => m.SettingsModule),
        data: { title: 'User Informations' }
      },
      {
        path: 'notice',
        loadChildren: () => import('./components/notice/notice.module').then(m => m.NoticeModule),
        data: { title: 'Notice' }
      },
      {
        path: 'cookie',
        loadChildren: () => import('./components/cookie/cookie.module').then(m => m.CookieModule),
      },
      {
        path: 'blog',
        loadChildren: () => import('./components/blog/blog.module').then(m => m.BlogModule),
      },
      {
        path: 'blog-detail',
        loadChildren: () => import('./components/blog-detail/blog-detail.module').then(m => m.BlogDetailModule),
      },
      {
        path: 'paytmcallback',
        loadChildren: () => import('./components/paytmcallback/paytmcallback.module').then(m => m.PaytmcallbackModule),
        data: { title: 'Success' }
      },
      {
        path: 'instamojocallback',
        loadChildren: () => import('./components/instamojocallback/instamojocallback.module').then(m => m.InstamojocallbackModule),
        data: { title: 'Success' }
      },
      {
        path: 'flutterwavecallback',
        loadChildren: () => import('./components/flutterwavecallback/flutterwavecallback.module').then(m => m.FlutterwavecallbackModule),
        data: { title: 'Success' }
      },
    ]
  },
  {
    path: '**',
    component: ErrorsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
