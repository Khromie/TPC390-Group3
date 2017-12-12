import {Component, ViewChild, AfterViewInit, ChangeDetectorRef} from "@angular/core";
import {DayPilot} from "daypilot-pro-angular";
import {
  DataService, ReservationData, CreateReservationParams, CreateRoomParams,
  UpdateReservationParams, UpdateRoomParams, MoveReservationParams
} from "../backend/data.service";
import {RoomEditComponent} from "./room-edit.component";
import {RoomCreateComponent} from "./room-create.component";
import {ReservationCreateComponent} from "./reservation-create.component";
import {ReservationEditComponent} from "./reservation-edit.component";
import {Router} from "@angular/router";

@Component({
  selector: 'scheduler-component',
  template: `
  <sidebar-container #sidebar [(expanded)]="expanded">
    <sidebar-expanded>
      <div style="padding: 3px;">
      <daypilot-navigator [config]="navigatorConfig" (dateChange)="dateChange()" #navigator></daypilot-navigator>
      </div>
    </sidebar-expanded>
    <sidebar-collapsed></sidebar-collapsed>
    <sidebar-main>
      <div class="main-header"><button (click)="createRoom()">Add Room...</button>      
      </div>      
      <div class="main-body">
        <daypilot-scheduler [config]="config" [events]="events" (viewChange)="viewChange($event)" #scheduler></daypilot-scheduler>
        <div class="main-bottom"></div>
      </div>
    </sidebar-main>
  </sidebar-container>
  <room-edit-dialog></room-edit-dialog>
  <room-create-dialog></room-create-dialog>
  <reservation-edit-dialog></reservation-edit-dialog>
  <reservation-create-dialog></reservation-create-dialog>
`,
  styles: [`

  h2 {
    padding-left: 5px;
    margin: 0;
  }
  
  input[type=checkbox] {
    vertical-align: middle;
    position: relative;
    bottom: 1px;
  }
  
  .main-header {
    white-space: nowrap;
    display: block;
    height: 30px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
    padding: 5px;
  }
  .main-body {
    position:absolute; left: 0px; right: 0px; top: 30px; bottom: 0px; overflow:hidden;
  }
  .main-bottom {
    border-top: 1px solid #ccc;
  }
  .row {
    margin-top: 2px;
    white-space: nowrap;
    display: block;
  }
  
`]
})
export class SchedulerComponent implements AfterViewInit {

  @ViewChild("scheduler") scheduler: DayPilot.Angular.Scheduler;
  @ViewChild("navigator") navigator: DayPilot.Angular.Navigator;
  @ViewChild(RoomEditComponent) roomEdit: RoomEditComponent;
  @ViewChild(RoomCreateComponent) roomCreate: RoomCreateComponent;
  @ViewChild(ReservationCreateComponent) reservationCreate: ReservationCreateComponent;
  @ViewChild(ReservationEditComponent) reservationEdit: ReservationEditComponent;

  events: any[] = [];

  expanded: boolean = true;

  navigatorConfig: any = {
    showMonths: 3,
    skipMonths: 3,
    selectMode: "month",
    startDate: "2017-01-01",
    selectionDay: "2017-02-01"
  };

  month = {
    from: null,
    to: null
  };

  getTimeline(date?: DayPilot.Date | string): any[] {
    var date = date || this.navigator.control.selectionDay;
    var start = new DayPilot.Date(date).firstDayOfMonth();
    var days = start.daysInMonth();

    var timeline = [];

    var checkin = 12;
    var checkout = 12;

    for (var i = 0; i < days; i++) {
      var day = start.addDays(i);
      timeline.push({start: day.addHours(checkin), end: day.addDays(1).addHours(checkout) });
    }

    return timeline;
  };

  menuRoom: DayPilot.Menu = new DayPilot.Menu({
    items: [
      {text: "Edit...", onClick: args => this.roomEdit.show(args.source).subscribe((params:UpdateRoomParams) => {
        if (params) {
          this.ds.updateRoom(params).subscribe(result => {
            let row = args.source;

            // update the client-side resource object
            row.data.name = result.name;
            row.data.capacity = result.capacity;
            row.data.status = result.status;

            this.scheduler.control.message("Room updated.");
          });
        }
      })
      },
      {text: "Delete", onClick: args => {
        let row = args.source;
        this.ds.deleteRoom(row.id).subscribe(result => {
          row.remove();
          this.scheduler.control.message("Room deleted.");
        });
      } }
    ]
  });

  config: any = {
    scale: "Manual",
    //timeline: this.getTimeline(),
    timeline: [],
    timeHeaders: [ { groupBy: "Month", format: "MMMM yyyy" }, { groupBy: "Day", format: "d" } ],
    eventDeleteHandling: "Update",
    allowEventOverlap: false,
    cellWidthSpec: "Auto",
    eventHeight: 60,
    rowHeaderColumns: [
      {title: "Room", width: 80},
      {title: "Capacity", width: 80},
      {title: "Status", width: 80}
    ],
    contextMenuResource: this.menuRoom,
    onBeforeRowHeaderRender: args => {
      let beds = function(count) {
        return count + " bed" + (count > 1 ? "s" : "");
      };

      args.row.columns[0].html = beds(args.row.data.capacity);
      args.row.columns[1].html = args.row.data.status;

      var color = "";
      switch (args.row.data.status) {
        case "Ready":
          color = "green"
          break;
        case "Dirty":
          color = "red";
          break;
        case "Cleanup":
          color = "orange";
          break;
      }


      // status
      args.row.columns[1].areas = [];
      args.row.columns[1].areas.push({
        right: 2,
        top: 2,
        bottom: 2,
        width: 3,
        backColor: color
      });

      // context menu icon
      args.row.areas = [];
      args.row.areas.push({
        top:3,
        right:4,
        visibility: "Hover",
        style: "font-size: 12px; background-color: #f9f9f9; border: 1px solid #ccc; padding: 2px 2px 0px 2px; cursor:pointer",
        icon: "icon-triangle-down",
        action: "ContextMenu"
      });
    },
    onEventMoved: args => {
      let params: MoveReservationParams = {
        id: args.e.id,
        start: args.newStart,
        end: args.newEnd,
        room: args.newResource
      };
      this.ds.moveReservation(params).subscribe(result => this.scheduler.control.message("Reservation moved."));
    },
    onEventResized: args => {
      let params: MoveReservationParams = {
        id: args.e.id,
        start: args.newStart,
        end: args.newEnd,
        room: args.e.resource()
      };
      this.ds.moveReservation(params).subscribe(result => this.scheduler.control.message("Reservation moved."));
    },
    onEventDeleted: args => {
      this.ds.deleteReservation(args.e.id()).subscribe(result => this.scheduler.control.message("Reservation deleted."));
    },
    onTimeRangeSelected: args => {
      this.reservationCreate.show(args).subscribe(params => {
        this.scheduler.control.clearSelection();
        if (params) {
          this.ds.createReservation(params).subscribe((data:ReservationData) => {
            this.events.push(data);
            this.scheduler.control.message("Reservation created.");
          });

        }

      });
    },
    onEventClick: args => {
      this.reservationEdit.show(args.e).subscribe((params:UpdateReservationParams) => {
        if (params) {
          this.ds.updateReservation(params).subscribe( (data: ReservationData) => {
            args.e.data.text = data.text;
            args.e.data.start = data.start;
            args.e.data.end = data.end;
            args.e.data.status = data.status;
            args.e.data.paid = data.paid;

            this.scheduler.control.message("Reservation updated.");
          });
        }

      });
    },
    onBeforeEventRender: args => {
      let start = new DayPilot.Date(args.data.start);
      let end = new DayPilot.Date(args.data.end);

      let now = new DayPilot.Date();
      //let today = DayPilot.Date.today();
      let today = new DayPilot.Date("2017-02-05");
      let status = "";

      // customize the reservation bar color and tooltip depending on status
      switch (args.e.status) {
        case "New":
          let in2days = today.addDays(1);

          if (start < in2days) {
            args.data.barColor = 'red';
            status = 'Expired (not confirmed in time)';
          }
          else {
            args.data.barColor = 'orange';
            status = 'New';
          }
          break;
        case "Confirmed":
          let arrivalDeadline = today.addHours(18);

          if (start < today || (start === today && now > arrivalDeadline)) { // must arrive before 6 pm
            args.data.barColor = "#f41616";  // red
            status = 'Late arrival';
          }
          else {
            args.data.barColor = "green";
            status = "Confirmed";
          }
          break;
        case 'Arrived': // arrived
          let checkoutDeadline = today.addHours(10);

          if (end < today || (end === today && now > checkoutDeadline)) { // must checkout before 10 am
            args.data.barColor = "#f41616";  // red
            status = "Late checkout";
          }
          else
          {
            args.data.barColor = "#1691f4";  // blue
            status = "Arrived";
          }
          break;
        case 'CheckedOut': // checked out
          args.data.barColor = "gray";
          status = "Checked out";
          break;
        default:
          status = "Unexpected state";
          break;
      }

      // customize the reservation HTML: text, start and end dates
      args.data.html = args.data.text + " (" + start.toString("M/d/yyyy") + " - " + end.toString("M/d/yyyy") + ")" + "<br /><span style='color:gray'>" + status + "</span>";

      // reservation tooltip that appears on hover - displays the status text
      args.e.toolTip = status;

      // add a bar highlighting how much has been paid already (using an "active area")
      let paid = args.e.paid;
      let paidColor = "#aaaaaa";
      args.data.areas = [
        { bottom: 10, right: 4, html: "<div style='color:" + paidColor + "; font-size: 8pt;'>Paid: " + paid + "%</div>", v: "Visible"},
        { left: 4, bottom: 8, right: 4, height: 2, html: "<div style='background-color:" + paidColor + "; height: 100%; width:" + paid + "%'></div>" }
      ];

    },
    heightSpec: "Max100Pct",
    hideBorderFor100PctHeight: true
  };

  constructor(private ds: DataService, private router: Router) {
  }

  ngAfterViewInit(): void {
    this.ds.getRooms().subscribe(result => this.config.resources = result);
  }

  viewChange(args) {
    // quit if the date range hasn't changed
    if (!args.visibleRangeChanged) {
      return;
    }

    let from = this.scheduler.control.visibleStart();
    let to = this.scheduler.control.visibleEnd();

    this.ds.getReservations(from, to).subscribe(result => {
      this.events = result;
    });
  }

  dateChange() {
    this.config.timeline = this.getTimeline(this.navigator.control.selectionStart);
  }

  createRoom() {

    this.roomCreate.show().subscribe((params: CreateRoomParams) => {
      if (params) {
        this.ds.createRoom(params).subscribe(room => {
          this.config.resources.push(room);
          this.scheduler.control.message("Room created.");
        });
      }
    });

  }

}

