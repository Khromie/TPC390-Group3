import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SchedulerComponent} from "../scheduler/scheduler.component";
import {LoginComponent} from "./login.component";
import {AuthGuard} from "./auth.guard";

const routes: Routes = [
  { path: '', component: SchedulerComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
