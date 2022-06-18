import { EmployeeModel } from './../models/Employe.model';
import { BusModel } from './../models/bus.model';
import { MemoryService } from './memory.service';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// export interface authResponse {
//   idToken: string;
//   email: string;
//   refreshToken: string;
//   expiresIn: string;
//   localId: string;
//   registered?: boolean;
//   passwordHash?: string;
//   providerUserInfo?: any;
// }

@Injectable({
  providedIn: 'root',
})
export class BusCrudService {
  Buses: BusModel[] = [];
  Drivers: EmployeeModel[] = [];
  busList = new Subject<BusModel[]>();
  driversList = new Subject<EmployeeModel[]>();

  constructor(
    // private http: HttpClient,
    private db: AngularFireDatabase,
    private memory: MemoryService
  ) {}

  getBus(id: number) {
    return this.Buses[id];
  }

  retrieveBuses() {
    return this.Buses;
  }

  retrieveDrivers() {
    return this.Drivers;
  }

  checkBus() {
    return this.Buses.length;
  }

  fetchBusSeatNo(busNo: string) {
    return this.Buses.filter((bus) => bus.busNo == busNo)[0].seatNo;
  }

  setDrivers() {
    const companyId = this.memory.getCompanyId();
    this.db.database
      .ref('company/' + companyId + '/employee')
      .orderByChild('role')
      .equalTo('Driver')
      .on('value', (snapshot) => {
        this.Drivers = [];
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            let temp: EmployeeModel;
            temp = snapshot.val()[key];
            temp.key = key;
            this.Drivers.push(temp);
          }
        }
        this.driversList.next(this.Drivers);
      });
  }

  deleteBus(bus: BusModel) {
    const companyId = this.memory.getCompanyId();
    const key = bus.key!;
    const index = this.Buses.indexOf(bus);
    return this.db
      .list('company/' + companyId + '/bus')
      .remove(key)
      .then(() => {
        this.Buses.splice(index, 1);
        this.busList.next(this.Buses);
      });
    // return this.db.database
    //   .ref('users')
    //   .orderByChild('eid')
    //   .equalTo(key)
    //   .once('value', (snapshot) => {
    //     snapshot.forEach((childSnapshot) => {
    //       const childKey = childSnapshot.key!;
    //       this.db
    //         .list('users')
    //         .remove(childKey)
    //         .then(() => {

    //         });
    //     });
    //   });
  }

  addBus(busDesc: BusModel) {
    const companyId = this.memory.getCompanyId();
    return this.db.list('company/' + companyId + '/bus').push({
      busNo: busDesc.busNo,
      drivers: busDesc.drivers,
      seatNo: busDesc.seatNo,
      onTrip: false,
    });
    // return this.http
    //   .post<authResponse>(
    //     'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
    //       environment.firebaseConfig.apiKey,
    //     {
    //       email: busDesc.email,
    //       password: busDesc.password,
    //       returnSecureToken: true,
    //     }
    //   )
    //   .pipe(
    //     catchError(this.handleError),
    //     tap((res) => {

    //         .then((response) => {
    //           const eid = response.key;
    //           // const cid = this.memory.getCompanyId();
    //           this.db
    //             .list('users')
    //             .push({
    //               uid: res.localId,
    //               cid: companyId,
    //               eid: eid,
    //               role: busDesc.role,
    //             })
    //             .then();
    //         });
    //     })
    //   );
  }

  setBuses() {
    const companyId = this.memory.getCompanyId();
    // this.Buses = [];
    const ref = this.db.database.ref('company/' + companyId + '/bus');
    // this.childChanged();
    // this.childAdded();
    return ref.on('value', (snapshot) => {
      this.Buses = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: BusModel;
          temp = snapshot.val()[key];
          temp.key = key;
          temp.onTrip = temp.onTrip ? temp.onTrip : [];
          this.Buses.push(temp);
        }
      }
      this.busList.next(this.Buses);
    });
  }

  // this one is used for every company sub property changes trip, name, passengers of trip . . . . . . etc
  childChanged() {
    const companyId = this.memory.getCompanyId();
    const ref = this.db.database.ref().child('company/' + companyId + '/bus');
    ref.on('child_changed', (snapshot) => {
      this.Buses.forEach((cur, index) => {
        if (cur.key === snapshot.key) {
          this.Buses[index] = snapshot.val();
          this.Buses[index].key = snapshot.key;
          // console.log('changed value called');
        }
      });
      this.busList.next(this.Buses);
    });
  }

  childAdded() {
    const companyId = this.memory.getCompanyId();
    const ref = this.db.database.ref().child('company/' + companyId + '/bus');
    ref.on('child_added', (snapshot) => {
      let temp: BusModel;
      temp = snapshot.val();
      temp.key = snapshot.key!;
      this.Buses.push(temp);
      this.busList.next(this.Buses);
    });
  }

  updatebus(bus: BusModel, key: string) {
    const companyId = this.memory.getCompanyId();
    bus.key = null!;
    return this.db.list('company/' + companyId + '/bus').update(key, bus);
  }

  // deleteBus(emp: BusModel) {
  //   const key = emp.key!;
  //   const index = this.Buses.indexOf(emp);
  //   return this.db.database
  //     .ref('users')
  //     .orderByChild('eid')
  //     .equalTo(key)
  //     .once('value', (snapshot) => {
  //       snapshot.forEach((childSnapshot) => {
  //         const childKey = childSnapshot.key!;
  //         this.db
  //           .list('users')
  //           .remove(childKey)
  //           .then(() => {
  //             this.db
  //               .list('company/' + companyId + '/bus')
  //               .remove(key)
  //               .then(() => {
  //                 this.Buses.splice(index, 1);
  //                 this.busList.next(this.Buses);
  //               });
  //           });
  //       });
  //     });
  // }

  //   private handleError(error: HttpErrorResponse) {
  //     let errorMessage = 'ERROR: በድጋሚ ያስገቡ!!';
  //     if (error.error) {
  //       switch (error.error.error.message) {
  //         case 'EMAIL_EXISTS':
  //           errorMessage =
  //             'ERROR: the EMAIL has been registered for another account!!';
  //           break;
  //         case 'EMAIL_NOT_FOUND':
  //           errorMessage = 'ERROR: ያስገቡት ኢሜል አልተመዘገበም ጸጋዬን ደውለው ያነጋግሩት!!';
  //           break;
  //         case 'INVALID_PASSWORD':
  //           errorMessage = 'ERROR: ፓስወርድ ተሳስተዋል በድጋሚ ይሞክሩ!!';
  //           break;
  //         default:
  //           errorMessage = error.error.error.message;
  //           break;
  //       }
  //       return throwError(errorMessage);
  //     }
  //     return throwError(errorMessage);
  //   }
}
