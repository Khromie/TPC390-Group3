import {Component, ViewChild} from "@angular/core";
import {DayPilot, DayPilotModalComponent} from "daypilot-pro-angular";
import {Validators, FormBuilder, FormGroup} from "@angular/forms";
import {DataService, UpdateRoomParams} from "../backend/data.service";
import {Observable, AsyncSubject} from "rxjs";

@Component({
  selector: 'room-edit-dialog',
  template: `
    <daypilot-modal>
    <div class="center">
      <h1>Edit Room</h1>
      <form [formGroup]="form">
        <div class="form-item">
          <input formControlName="name" type="text" placeholder="Resource Name"> <span *ngIf="!form.controls.name.valid">Resource name required</span>
        </div>
        <div class="form-item">Size:
          <select formControlName="capacity">
            <option *ngFor="let it of capacities" [ngValue]="it.value">{{it.name}}</option>
          </select>
        </div>
        <div class="form-item">
          Status:
          <select formControlName="status">
            <option *ngFor="let it of statuses" [ngValue]="it.value">{{it.name}}</option>
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
export class RoomEditComponent {
  @ViewChild(DayPilotModalComponent) modal : DayPilotModalComponent;

  form: FormGroup;

  row: DayPilot.Row;

  subject: AsyncSubject<UpdateRoomParams>;

  capacities: any[] = [
    { name: "1 bed", value: "1"},
    { name: "2 beds", value: "2"},
    { name: "3 beds", value: "3"},
    { name: "4 beds", value: "4"}
  ];

  statuses: any[] = [
    { name: "Ready", value: "Ready"},
    { name: "Cleanup", value: "Cleanup"},
    { name: "Dirty", value: "Dirty"}
  ];

  constructor(private fb: FormBuilder, private ds: DataService) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      capacity: ["1", Validators.required],
      status: ["Ready", Validators.required]
    });
  }

  show(row: DayPilot.Row): Observable<UpdateRoomParams>   {
    this.row = row;
    this.form.setValue({
      name: row.name,
      capacity: row.data.capacity,
      status: row.data.status
    });
    this.modal.show();

    this.subject = new AsyncSubject();
    return this.subject.asObservable();

  }

  submit() {
    let data = this.form.getRawValue();

    let params: UpdateRoomParams = {
      id: this.row.id,
      name: data.name,
      capacity: data.capacity,
      status: data.status
    };

    this.modal.hide();

    this.subject.next(params);
    this.subject.complete();
  }

  cancel() {
    this.modal.hide();
  }

}

