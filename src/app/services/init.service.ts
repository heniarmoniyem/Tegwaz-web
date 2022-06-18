import { Subject } from 'rxjs';
import { BusModel } from './../models/bus.model';
import { AngularFireDatabase } from '@angular/fire/database';
import { TripModel } from './../models/trip.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(private db: AngularFireDatabase) {}

  tripsInitialization() {
    const ref = this.db.database.ref('trip');
    return ref.once('value', (snapshot) => {
      // this.Trips = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: TripModel;
          temp = snapshot.val()[key];
          temp.key = key;
          console.log(temp.date);
          const tripDate = new Date(temp.date.split(' / ')[0]);
          const dateCondition = tripDate.getDate() < new Date().getDate();
          const monthCondition = tripDate.getMonth() < new Date().getMonth();
          const yearCondition = tripDate.getMonth() < new Date().getMonth();

          if (dateCondition || monthCondition || yearCondition) {
            this.db
              .list('trip')
              .remove(key)
              .then(() => {
                temp.status = [false, false];
                this.db
                  .list('passed_trips')
                  .push(temp)
                  .then(() => {
                    this.busOnTripUpdation(temp.companyId, temp.busNo);
                  });
              });
          }
        }
      }
    });
  }

  private busOnTripUpdation(companyId: string, busNo: string) {
    return this.db.database
      .ref('company/' + companyId + '/bus')
      .orderByChild('busNo')
      .equalTo(busNo)
      .once('value', (snapshot) => {
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            const temp: BusModel = snapshot.val()[key];
            temp.onTrip.forEach((trip, index) => {
              const condition = new Date(trip.date) < new Date();
              if (condition) {
                temp.onTrip.splice(index, 1);
              }
            });
            this.db.list('company/' + companyId + '/bus').update(key, temp);
          }
        }
      });
  }
}
