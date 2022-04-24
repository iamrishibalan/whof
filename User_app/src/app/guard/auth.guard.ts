
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApisService } from '../services/apis.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private authServ: ApisService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): any {
        const uid = localStorage.getItem('uid');
        console.log('uid', localStorage.getItem('uid'));
        if (uid && uid != null && uid !== 'null') {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
