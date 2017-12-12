import {Component, ViewChild} from "@angular/core";
import {DayPilot, DayPilotModalComponent} from "daypilot-pro-angular";
import {Validators, FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {DataService, UpdateReservationParams} from "../backend/data.service";
import {Observable, AsyncSubject} from "rxjs";
import Modal = DayPilot.Angular.Modal;

@Component({
  selector: 'reservation-edit-dialog',
  template: `
    <daypilot-modal>
    <div class="center">
      <h1>Update Reservation</h1>
      <form [formGroup]="form">
        <div class="form-item">
          <input formControlName="name" type="text" placeholder="Event Name"> <span *ngIf="!form.controls.name.valid">Event name required</span>
        </div>
        <div class="form-item">
          Room:
          <select formControlName="resource">
            <option *ngFor="let it of resources" [ngValue]="it.id">{{it.name}}</option>
          </select>
        </div>
        <div class="form-item">
          <input formControlName="start" type="text" placeholder="Start"> <span *ngIf="!form.controls.start.valid">Invalid datetime</span>
        </div>
        <div class="form-item">
          <input formControlName="end" type="text" placeholder="End"> <span *ngIf="!form.controls.end.valid">Invalid datetime</span>
        </div>
        <div class="form-item">
          Status:
          <select formControlName="status">
            <option *ngFor="let it of statuses" [ngValue]="it.value">{{it.name}}</option>
          </select>
        </div>
        <div class="form-item">
          Paid:
          <select formControlName="paid">
            <option *ngFor="let it of paid" [ngValue]="it.value">{{it.name}}</option>
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
export class ReservationEditComponent {
  @ViewChild(DayPilotModalComponent) modal : DayPilotModalComponent;

  form: FormGroup;
  dateFormat = "MM/dd/yyyy h:mm tt";

  resources: any[];

  event: DayPilot.Event;

  subject: AsyncSubject<UpdateReservationParams>;

  statuses: any[] = [
    { name: "New", value: "New"},
    { name: "Confirmed", value: "Confirmed"},
    { name: "Arrived", value: "Arrived"},
    { name: "Checked Out", value: "CheckedOut"},
  ];

   paid: any[] = [
     { name: "0%", value: "0"},
     { name: "50%", value: "50"},
     { name: "100%", value: "100"},
   ];

  constructor(private fb: FormBuilder, private ds: DataService) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      start: ["", this.dateTimeValidator(this.dateFormat)],
      end: ["", [Validators.required, this.dateTimeValidator(this.dateFormat)]],
      resource: ["", Validators.required],
      status: ["", Validators.required],
      paid: ["", Validators.required]
    });


  }

  show(ev: DayPilot.Event): Observable<UpdateReservationParams>  {
    this.ds.getRooms().subscribe(result => this.resources = result);

    this.event = ev;

    this.form.setValue({
      start: ev.start().toString(this.dateFormat),
      end: ev.end().toString(this.dateFormat),
      name: ev.text(),
      resource: ev.resource(),
      status: ev.data.status,
      paid: ev.data.paid
    });
    this.modal.show();

    this.subject = new AsyncSubject();
    return this.subject.asObservable();
  }

  submit() {
    let data = this.form.getRawValue();

    let params: UpdateReservationParams = {
      id: this.event.id(),
      start: DayPilot.Date.parse(data.start, this.dateFormat),
      end: DayPilot.Date.parse(data.end, this.dateFormat),
      room: data.resource,
      name: data.name,
      status: data.status,
      paid: data.paid
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

  dateTimeValidator(format: string) {
    return function(c:FormControl) {
      let valid = !!DayPilot.Date.parse(c.value, format);
      return valid ? null : {badDateTimeFormat: true};
    };
  }
}

