import {Component, ViewChild, Output, EventEmitter} from '@angular/core';
import {DayPilot, DayPilotModalComponent} from "daypilot-pro-angular";
import Modal = DayPilot.Angular.Modal;
import {Validators, FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {
  DataService, CreateReservationParams, ReservationData, UpdateReservationParams,
  CreateRoomParams
} from "../backend/data.service";
import {AsyncSubject, Observable} from "rxjs";

@Component({
  selector: 'room-create-dialog',
  template: `
    <daypilot-modal>
    <div class="center">
      <h1>Create Room</h1>
      <form [formGroup]="form">
        <div class="form-item">
          <input formControlName="name" type="text" placeholder="Resource Name"> <span *ngIf="!form.controls.name.valid">Room name required</span>
        </div>
        <div class="form-item">
          <select formControlName="capacity">
            <option *ngFor="let c of capacities" [ngValue]="c.value">{{c.name}}</option>
          </select>
        </div>
        <div class="form-item">
          <button (click)="submit()" [disabled]="!form.valid">Save</button>
          <button (click)="cancel()">Cancel</button>
        </div>
    </form>
    </div>
    </daypilot-modal>
  `,
  styles: [`
  .center {
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
  .form-item {
    margin: 4px 0px;
  }
  `]
})
export class RoomCreateComponent {
  @ViewChild(DayPilotModalComponent) modal : DayPilotModalComponent;

  form: FormGroup;

  row: DayPilot.Row;

  subject: AsyncSubject<CreateRoomParams>;

  capacities: any[] = [
    { name: "1 bed", value: 1},
    { name: "2 beds", value: 2},
    { name: "3 beds", value: 3},
    { name: "4 beds", value: 4}
  ];

  constructor(private fb: FormBuilder, private ds: DataService) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      capacity: [1, Validators.required],
    });
  }

  show(): Observable<CreateRoomParams> {
    this.form.setValue({
      name: "",
      capacity: 1
    });
    this.modal.show();

    this.subject = new AsyncSubject();
    return this.subject.asObservable();

  }

  submit() {
    let data = this.form.getRawValue();

    let params: CreateRoomParams = {
      name: data.name,
      capacity: data.capacity
    };

    this.modal.hide();

    this.subject.next(params);
    this.subject.complete();

  }

  cancel() {
    this.modal.hide();

    this.subject.next(null);
    this.subject.complete();
  }


}

