import {Component, ViewChild} from "@angular/core";
import {DayPilot, DayPilotModalComponent} from "daypilot-pro-angular";
import {Validators, FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {DataService, CreateReservationParams} from "../backend/data.service";
import {Observable, AsyncSubject} from "rxjs";
import Modal = DayPilot.Angular.Modal;

@Component({
  selector: 'reservation-create-dialog',
  template: `
    <daypilot-modal>
    <div class="center">
      <h1>Create Reservation</h1>
      <form [formGroup]="form">
        <div class="form-item">
          <input formControlName="name" type="text" placeholder="Guest Name"> <span *ngIf="!form.controls.name.valid">Guest name required</span>
        </div>
        <div class="form-item">
          <select formControlName="resource">
            <option *ngFor="let r of resources" [ngValue]="r.id">{{r.name}}</option>
          </select>
        </div>
        <div class="form-item">
          <input formControlName="start" type="text" placeholder="Start"> <span *ngIf="!form.controls.start.valid">Invalid datetime</span>
        </div>
        <div class="form-item">
          <input formControlName="end" type="text" placeholder="End"> <span *ngIf="!form.controls.end.valid">Invalid datetime</span>
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
export class ReservationCreateComponent {
  @ViewChild(DayPilotModalComponent) modal : DayPilotModalComponent;

  form: FormGroup;
  dateFormat = "MM/dd/yyyy h:mm tt";

  resources: any[];

  subject: AsyncSubject<CreateReservationParams>;

  constructor(private fb: FormBuilder, private ds: DataService) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      start: ["", this.dateTimeValidator(this.dateFormat)],
      end: ["", [Validators.required, this.dateTimeValidator(this.dateFormat)]],
      resource: ["", Validators.required]
    });
  }

  show(args: any): Observable<CreateReservationParams> {
    this.ds.getRooms().subscribe(result => this.resources = result);

    args.name = "";
    this.form.setValue({
      start: args.start.toString(this.dateFormat),
      end: args.end.toString(this.dateFormat),
      name: "",
      resource: args.resource
    });
    this.modal.show();

    this.subject = new AsyncSubject();
    return this.subject.asObservable();
  }

  submit() {
    let data = this.form.getRawValue();

    let params: CreateReservationParams = {
      start: DayPilot.Date.parse(data.start, this.dateFormat).toString(),
      end: DayPilot.Date.parse(data.end, this.dateFormat).toString(),
      name: data.name,
      room: data.resource
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
