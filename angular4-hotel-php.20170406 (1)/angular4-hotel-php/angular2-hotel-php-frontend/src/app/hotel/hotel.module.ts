import {HttpModule} from "@angular/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {AppRoutingModule} from "./hotel-routing.module";
import {SchedulerModule} from "../scheduler/scheduler.module";
import {HotelComponent} from "./hotel.component";
import {LoginComponent} from "./login.component";
import {AuthGuard} from "./auth.guard";
import {DataModule} from "../backend/backend.module";

@NgModule({
  imports:      [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    SchedulerModule,
    AppRoutingModule,
    DataModule
  ],
  declarations: [
    HotelComponent,
    LoginComponent
  ],
  exports:      [ HotelComponent ],
  providers:    [ AuthGuard]
})
export class HotelModule { }

