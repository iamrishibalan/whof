
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApisService } from '../services/apis.service';

@Injectable({
    providedIn: 'root'
})
export class LocationGuard implements CanActivate {

    constructor(private authServ: ApisService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): any {
        const location = localStorage.getItem('location');
        console.log('location', localStorage.getItem('location'));
        if (location && location != null && location !== 'null') {
            return true;
        }
        this.router.navigate(['/location']);
        return false;
    }
}
