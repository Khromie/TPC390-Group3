import {Component, AfterViewInit} from "@angular/core";
import {DataService} from "../backend/data.service";


@Component({
  selector: 'hotel-component',
  template: `
  <div class="fullscreen">
  <div class="toolbar">
    <span class="user">Logged in as <b>{{ds.user}}</b> <a href="" (click)="logout()" *ngIf="loggedIn()">Logout</a></span>  
  </div>
  <div class="content">
    <router-outlet></router-outlet>
  </div>
  </div>
`,
  styles: [`
  .fullscreen {
    position: absolute; top:90px; left: 0px; right: 0px; bottom: 0px;
  }
  .toolbar {
    position: absolute; top: 0px; left: 0px; right: 0px; height: 25px; background-color: #f0f0f0;
  }
  .content {
    position: absolute; top: 25px; left: 0px; right: 0px; bottom: 0px;
  }
  .user {
    float: right;
    margin-top: 5px;
    margin-right: 10px;
  }
`]
})
export class HotelComponent implements AfterViewInit {

  constructor(private ds: DataService) {
  }

  ngAfterViewInit(): void {

  }

  logout() {
    this.ds.logout();
    return false;
  }

  loggedIn() {
    return this.ds.isLoggedIn();
  }

}

