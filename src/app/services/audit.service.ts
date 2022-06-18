import { BusModel } from './../models/bus.model';
import { PassengerModel } from './../models/passenger.model';
import { PlaceModel } from './../models/place.,model';
import { Subject } from 'rxjs';
import { TripModel } from './../models/trip.model';
import { AngularFireDatabase } from '@angular/fire/database';
import { MemoryService } from './memory.service';
import { Injectable } from '@angular/core';

export interface tripInterface {
  bookingMethod: string;
  name: string;
  phoneNo: string;
}
export interface auditInterface {
  tripKey: string;
  tripDetail: string;
  status: boolean[];
  tripReport: reportInterface[];
}

export interface reportInterface {
  label: string;
  passengerNo: number;
  amount: number;
}

interface placeInterface {
  companyId: string;
  place: PlaceModel[];
}

interface busInterface {
  companyId: string;
  bus: BusModel[];
}

interface employeeInterface {
  id: string;
  name: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuditService {
  Trips: TripModel[] = [];
  auditReportList = new Subject<auditInterface[]>();
  role: string;
  companyId: string;
  companyIdArray: string[] = [];
  Places: placeInterface[] = [];
  auditReport: auditInterface[] = [];
  Buses: busInterface[] = [];
  branchAuditReport: reportInterface[] = [];
  branchEmployeeList: employeeInterface[] = [];

  constructor(private db: AngularFireDatabase, private memory: MemoryService) {}

  setTrips() {
    this.companyId = this.memory.getCompanyId();
    this.role = this.memory.getRole();
    const ref =
      this.role == 'Admin'
        ? this.db.database
            .ref('passed_trips')
            .orderByChild('companyId')
            .equalTo(this.companyId)
        : this.db.database.ref('passed_trips');

    ref.once('value', (snapshot) => {
      this.Trips = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: TripModel;
          temp = snapshot.val()[key];
          if (!this.companyIdArray.includes(temp.companyId)) {
            this.companyIdArray.push(temp.companyId);
          }
          temp.key = key;
          const passengers: PassengerModel[] = [];
          for (const key in temp.passengers) {
            if (temp.passengers.hasOwnProperty(key)) {
              let passTemp: PassengerModel;
              passTemp = temp.passengers[key];
              passTemp.key = key;
              passTemp.bookingMethod = passTemp.bookingMethod
                ? passTemp.bookingMethod
                : 'App';

              passengers.push(passTemp);
            }
          }
          temp.passengers = passengers;
          this.Trips.push(temp);
        }
      }
      this.fetchPlaces();
      this.calculatePaymentAudit();
    });
    this.childChanged();
  }

  fetchPlaces() {
    // Place Setter
    this.Places = [];
    this.Buses = [];

    this.companyIdArray.forEach((companyId) => {
      const placeTemp: placeInterface = { companyId, place: [] };
      const ref = this.db.database.ref('company/' + companyId + '/place');
      ref.once('value', (snapshot) => {
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            placeTemp.place.push(snapshot.val()[key]);
          }
        }
      });
      this.Places.push(placeTemp);

      // bus Setter
      const busTemp: busInterface = { companyId, bus: [] };
      this.db.database
        .ref('company/' + companyId + '/bus')
        .on('value', (snapshot) => {
          for (const key in snapshot.val()) {
            if (snapshot.val().hasOwnProperty(key)) {
              busTemp.bus.push(snapshot.val()[key]);
            }
          }
          this.Buses.push(busTemp);
        });
    });
  }

  calculatePaymentAudit() {
    this.auditReport = [];
    this.Trips.forEach((trip) => {
      if (
        (!trip.status[0] && this.role == 'Admin') ||
        (!trip.status[1] && this.role == 'Super Admin')
      ) {
        const place =
          trip.startingCity == 'addis ababa / አዲስ አበባ'
            ? trip.destinationCity
            : trip.startingCity;
        const appReport: reportInterface = {
          label: 'Application',
          passengerNo: 0,
          amount: 0,
        };
        const branchReport: reportInterface = {
          label: 'Branch',
          passengerNo: 0,
          amount: 0,
        };
        const bankReport: reportInterface = {
          label: 'Bank',
          passengerNo: 0,
          amount: 0,
        };
        const temp: auditInterface = {
          tripKey: '',
          tripDetail: '',
          status: [],
          tripReport: [],
        };
        trip.passengers.forEach((passenger) => {
          passenger.bookingMethod == 'App'
            ? appReport.passengerNo++
            : branchReport.passengerNo++;
        });
        temp.status = trip.status!;
        temp.tripDetail = `Trip From <${trip.startingCity}> To <${trip.destinationCity}> On <${trip.date}>`; // todo list - starting place, destination place, date and price
        temp.tripKey = trip.key!;
        temp.tripReport.push(appReport);
        temp.tripReport.push(branchReport);
        temp.tripReport.push(bankReport);
        const price = this.fetchPrice(
          trip.companyId,
          trip.startingCity,
          trip.destinationCity
        );

        temp.tripReport.forEach((report, index) => {
          temp.tripReport[index].amount = price * report.passengerNo;
        });
        this.auditReport.push(temp);
      }
    });
    this.auditReportList.next(this.auditReport);
  }

  private fetchPrice(
    companyId: string,
    startingCity: string,
    destinationCity: string
  ) {
    const conditionalCity =
      startingCity == 'addis ababa / አዲስ አበባ' ? destinationCity : startingCity;
    let returnValue = 0;
    this.Places.forEach((place) => {
      if (place.companyId == companyId) {
        returnValue = place.place.filter(
          (destination) => destination.destination == conditionalCity
        )[0].price;
      }
    });

    return returnValue;
  }

  // updateStatus(tripId: string) {
  //   console.log(tripId);
  //   const trip = this.Trips.find((trip) => trip.key == tripId);
  //   trip.status = [true, false];
  //   if (this.role == 'Admin') {
  //     trip.status[0] = true;
  //   } else {
  //     status[1] = true;
  //   }
  //   this.db.list('passed_trips/' + tripId).update(tripId, status);
  // }

  childChanged() {
    const ref =
      this.role == 'Admin'
        ? this.db.database
            .ref('passed_trips')
            .orderByChild('companyId')
            .equalTo(this.companyId)
        : this.db.database.ref('passed_trips');

    ref.on('child_changed', (snapshot) => {
      this.Trips.forEach((cur, index) => {
        if (cur.key === snapshot.key) {
          this.Trips[index] = snapshot.val();
          this.Trips[index].key = cur.key;
        }
      });

      this.calculatePaymentAudit();
    });
  }

  fetchCompanyName(tripId: string) {
    const companyId = this.Trips.find((trip) => trip.key == tripId)?.companyId;
    const companyName = '';
    return this.db.database
      .ref('company/' + companyId + '/companyName')
      .once('value', (snapshot) => {
        return snapshot.val();
      });
  }

  fetchTripDetail(tripId: string): tripInterface[] {
    const tripsDetail: tripInterface[] = [];

    this.Trips.forEach((trip) => {
      if (trip.key == tripId) {
        trip.passengers.forEach((pass) => {
          const bookingMethod =
            pass.bookingMethod == 'App' ? 'Application' : 'Branch';
          const temp: tripInterface = {
            bookingMethod,
            name: pass.fullName,
            phoneNo: pass.phoneNo.toString(),
          };
          tripsDetail.push(temp);
        });
      }
    });
    return tripsDetail;
  }

  auditBranch(tripId: string): reportInterface[] {
    this.branchAuditReport = [];
    const trip = this.Trips.find((trip) => trip.key == tripId);
    const passengers = trip?.passengers.filter(
      (passenger) => passenger.bookingMethod != 'App'
    );
    const companyId = this.Trips.filter((trip) => trip.key)[0].companyId;
    passengers?.forEach((passenger) => {
      if (
        !this.branchEmployeeList.some(
          (employee) => employee.id == passenger.bookingMethod
        )
      ) {
        this.db.database
          .ref(
            'company/' +
              companyId +
              '/employee/' +
              passenger.bookingMethod +
              '/fullName'
          )
          .once('value', (snapshot) => {
            // const name: string = snapshot.val();
            this.branchEmployeeList.push({
              id: passenger.bookingMethod,
              name: snapshot.val(),
            });
          });
      }
    });

    // check if the employee has previous sold ticket
    passengers?.forEach((passenger) => {
      const branchName = this.branchEmployeeList.find(
        (employee) => employee.id == passenger.bookingMethod
      )?.name;
      let branchReportIndex = 0;
      if (
        this.branchAuditReport.some((audRep, index) => {
          branchReportIndex = index;
          return audRep.label == branchName;
        })
      ) {
        this.branchAuditReport[branchReportIndex].passengerNo++;
      } else {
        this.branchAuditReport.push({
          label: branchName!,
          passengerNo: 1,
          amount: 0,
        });
      }
    });

    const price = this.fetchPrice(
      trip?.companyId!,
      trip?.startingCity!,
      trip?.destinationCity!
    );

    this.branchAuditReport.forEach((report, index) => {
      this.branchAuditReport[index].amount = price * report.passengerNo;
    });

    return this.branchAuditReport;
  }
}
