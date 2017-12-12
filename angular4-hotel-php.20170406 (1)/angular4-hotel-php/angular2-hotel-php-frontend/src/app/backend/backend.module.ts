import {HttpModule} from "@angular/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {DataService} from "./data.service";

@NgModule({
  imports:      [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule
  ],
  declarations: [

  ],
  exports:      [  ],
  providers:    [ DataService ]
})
export class DataModule { }

