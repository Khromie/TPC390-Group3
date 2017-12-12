import {Component, AfterViewInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DataService} from "../backend/data.service";

@Component({
  selector: 'login-component',
  template: `
<form>

  <h2>Log In</h2>

  <div *ngIf="errorMessage" style="padding: 20px; background-color: #ffeeee;">{{errorMessage}}</div>

  <div class="space">
  Use admin/admin to log in.
  </div>

  <div class="space">
    <input type="text" [(ngModel)]="user.username" name="username" placeholder="Username">
  </div>
  <div class="space">
    <input type="password" [(ngModel)]="user.password" name="password" placeholder="Password">
  </div>
  <div class="space">
    <button (click)="login()">Log In</button>
  </div>
</form>
`,
  styles: [`
  form {
    padding: 10px;
  }
`]
})
export class LoginComponent implements AfterViewInit {

  user = {
    username: "",
    password: ""
  };

  errorMessage: string;

  constructor(private route: ActivatedRoute, private ds: DataService, private router: Router) {}

  ngAfterViewInit(): void {
  }

  login() {
    this.ds.doLogin(this.user).subscribe(result => {
      if (result.user) {
        let returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        localStorage.setItem("user", JSON.stringify(result.user));
        this.router.navigate([returnUrl]);
      }
      else {
        this.errorMessage = "Login failed";
      }

    });
  }


}

