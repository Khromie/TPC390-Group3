import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Observable} from "rxjs";
import {DataService} from "../backend/data.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private ds: DataService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.ds.getUser().map(result => {
      if (result.user) {
        return true;
      }
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      return false;
    });
  }
}
