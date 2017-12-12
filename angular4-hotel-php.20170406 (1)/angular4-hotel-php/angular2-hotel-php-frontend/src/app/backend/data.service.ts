import {Http, Response, RequestOptions, Headers} from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/Rx';
import {DayPilot} from 'daypilot-pro-angular';
import {Router} from "@angular/router";

@Injectable()
export class DataService {

  user: any;

  constructor(private http : Http, private router: Router){
  }

  requestOptions(): RequestOptions {
    let storedUser = localStorage.getItem("user");
    let headers = new Headers();
    if (storedUser) {
      let user = JSON.parse(storedUser);
      if (user) {
        headers.append("X-Auth-Token", user.token);
      }
    }
    return new RequestOptions({headers: headers});
  }

  getUser(): Observable<any> {
    return this.http.post("/api/backend_user.php", {}, this.requestOptions()).map((response:Response) => {
      let responseObject = response.json();
      this.user = responseObject.user;
      return responseObject;
    });
  }

  doLogin(user:{username: string, password: string}): Observable<any> {
    return this.http.post("/api/backend_login.php", user).map((response:Response) => response.json());
  }

  isLoggedIn() {
    return !!localStorage.getItem("user");
  }

  logout() {
    localStorage.removeItem("user");
    this.router.navigate(["/login"]);
  }

  getReservations(from: DayPilot.Date, to: DayPilot.Date): Observable<any[]> {
    return this.http.post("/api/backend_reservations.php", {start: from.toString(), end: to.toString()}, this.requestOptions()).map((response:Response) => response.json());
  }

  createReservation(data: CreateReservationParams): Observable<ReservationData> {
    return this.http.post("/api/backend_reservation_create.php", data, this.requestOptions()).map((response:Response) => {
      return {
        id: response.json().id,
        start: data.start,
        end: data.end,
        resource: data.room,
        text: data.name,
        status: "New",
        paid: "0"
      };
    });
  }

  deleteReservation(id: string): Observable<any> {
    return this.http.post("/api/backend_reservation_delete.php", {id: id}, this.requestOptions()).map((response:Response) => response.json());
  }

  updateReservation(params: UpdateReservationParams): Observable<ReservationData> {
    return this.http.post("/api/backend_reservation_update.php", params, this.requestOptions()).map((response:Response) => {
      return {
        id: params.id,
        start: params.start,
        end: params.end,
        text: params.name,
        resource: params.room,
        status: params.status,
        paid: params.paid
      };
    });
  }

  moveReservation(params: MoveReservationParams): Observable<any> {
    return this.http.post("/api/backend_reservation_move.php", params, this.requestOptions()).map((response:Response) => response.json());
  }

  getRooms(): Observable<any[]> {
    return this.http.post("/api/backend_rooms.php", {capacity: 0}, this.requestOptions()).map((response:Response) => response.json());
  }

  createRoom(params: CreateRoomParams): Observable<RoomData> {
    return this.http.post("/api/backend_room_create.php", params, this.requestOptions()).map((response:Response) => {
      return {
        name: params.name,
        capacity: params.capacity,
        status: "Ready",
        id: response.json().id,
      };
    });
  }

  updateRoom(params: UpdateRoomParams): Observable<RoomData> {
    return this.http.post("/api/backend_room_update.php", params, this.requestOptions()).map((response:Response) => {
      return {
        id: params.id,
        name: params.name,
        capacity: params.capacity,
        status: params.status
      };
    });
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.post("/api/backend_room_delete.php", {id: id}, this.requestOptions()).map((response:Response) => response.json());
  }

}

export interface CreateReservationParams {
  start: string;
  end: string;
  name: string;
  room: string | number;
}

export interface UpdateReservationParams {
  id: string;
  start: DayPilot.Date;
  end: DayPilot.Date;
  room: string;
  name: string;
  status: string;
  paid: number | string;
}

export interface MoveReservationParams {
  id: string;
  start: DayPilot.Date;
  end: DayPilot.Date;
  room: string;
}

export interface CreateRoomParams {
  name: string;
  capacity: number;
}

export interface UpdateRoomParams {
  id: string;
  name: string;
  capacity: number;
  status: string;
}

export interface ReservationData {
  id: string | number;
  start: string | DayPilot.Date;
  end: string | DayPilot.Date;
  text: string;
  resource: string | number;
  status: string;
  paid: number | string;
}

export interface RoomData {
  id: string;
  name: string;
  capacity: number;
  status: string;
}
