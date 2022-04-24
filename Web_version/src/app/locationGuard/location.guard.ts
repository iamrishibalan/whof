
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocationGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): any {
    const location = localStorage.getItem('location');
    console.log('location', localStorage.getItem('location'));
    if (location && location != null && location !== 'null') {
      return true;
    }
    this.router.navigate(['/home']);
    return false;
  }
}
