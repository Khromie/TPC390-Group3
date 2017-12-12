import {HttpModule} from "@angular/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {SchedulerComponent} from "./scheduler.component";
import {DayPilot, DayPilotModule} from "daypilot-pro-angular";
import {SidebarModule} from "../sidebar/sidebar.module";
import {RoomCreateComponent} from "./room-create.component";
import {RoomEditComponent} from "./room-edit.component";
import {ReservationCreateComponent} from "./reservation-create.component";
import {ReservationEditComponent} from "./reservation-edit.component";
import {AppRoutingModule} from "../hotel/hotel-routing.module";
import {DataModule} from "../backend/backend.module";

@NgModule({
  imports:      [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    SidebarModule,
    AppRoutingModule,
    DataModule,
    DayPilotModule
  ],
  declarations: [
    SchedulerComponent,
    RoomCreateComponent,
    RoomEditComponent,
    ReservationCreateComponent,
    ReservationEditComponent
  ],
  exports:      [ SchedulerComponent ],
  providers:    [  ]
})
export class SchedulerModule { }
