import { myTripsModel } from './../home/my-trips/my-trips.component';
import { TripService } from './trip.service';
import { AdminAccountService } from 'src/app/services/admin-account.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MyTripService {
  constructor(private cs: AdminAccountService, private ts: TripService) {}

  fetch() {
    const tripsData: {
      tripId: string;
      passangerId: string;
    }[] = JSON.parse(localStorage.getItem('myTrips')!);

    if (tripsData) {
      const returnVal: myTripsModel[] = [];
      tripsData.forEach((data) => {
        const temp: any = this.ts.fetchMyTrip(data.tripId, data.passangerId);
        if (temp) {
          returnVal.push(temp);
        }
      });
      return returnVal;
    } else {
      return [];
    }
  }
}
