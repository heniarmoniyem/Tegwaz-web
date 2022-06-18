import { PassengerModel } from './../models/passenger.model';
import { TripModel } from './../models/trip.model';
import { SPModel } from './../models/startingPlace.model';
import { BusModel, onTrip } from './../models/bus.model';
import { Subject } from 'rxjs';
import { MemoryService } from './memory.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface check {
  label: string;
  value: string;
  checked?: boolean;
  disabled: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class TripService {
  Destinations: string[] = [];
  destinationList = new Subject<string[]>();
  Buses: BusModel[] = [];
  busList = new Subject<BusModel[]>();
  SP: SPModel;
  SPList = new Subject<SPModel>();
  RSP: SPModel;
  RSPList = new Subject<SPModel>();
  driversList = new Subject<string[]>();
  Trips: TripModel[] = [];
  tripsList = new Subject<TripModel[]>();
  city: string;
  type: string;
  BusSelectionMessage = new Subject<{ message: string; busNo: string }>();

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase,
    private memory: MemoryService
  ) {}

  retrieveTrips() {
    return this.Trips;
  }

  fetchSP(key: string) {
    if (!this.Trips.length) {
      return [];
    } else {
      const sp = this.Trips.map((trip) => {
        if (trip.key == key) {
          return trip.startingPlace;
        }
        return;
      });
      return sp[0];
    }
  }

  fetchMyTrip(tripId: string, passangerId: string) {
    let myTrip: any;
    this.Trips.forEach((trip) => {
      if (trip.key == tripId) {
        let seatNo = 0;
        let fullName = '';
        let phoneNo = '';
        let departurePlace = '';
        trip.passengers.forEach((pass) => {
          if (pass.key == passangerId) {
            seatNo = pass.seatNo;
            fullName = pass.fullName;
            phoneNo = pass.phoneNo;
            departurePlace = pass.startingPlace[0];
          }
        });

        myTrip = {
          tripId,
          passangerId,
          startingCity: trip.startingCity,
          destinationCity: trip.destinationCity,
          date: trip.date,
          passengerName: fullName,
          phoneNo,
          seatNo,
          departurePlace,
        };
      }
    });
    return myTrip;
  }

  checkTrips() {
    return this.Trips.length;
  }

  countUpcomingTrips(companyId: string) {
    let returnVal = 0;
    this.Trips.forEach((trip) => {
      if (trip.companyId == companyId) {
        returnVal++;
      }
    });
    return returnVal;
  }

  fetchTripDetail(index: number) {
    return this.Trips[index];
  }

  returnDrivers(busNo: string) {
    const driver = this.Buses.filter((bus) => bus.busNo == busNo).map(
      (cur) => cur.drivers
    );
    this.driversList.next(driver[0]);
  }

  save() {
    console.log(this.SP);
  }

  SPUpdate(
    updatedForm: check[],
    type: string, // SP / RSP
    destinationCity: string
  ) {
    const companyId = this.memory.getCompanyId();
    const temp: SPModel = type == 'SP' ? this.SP : this.RSP;

    temp.places.forEach((place, pindex) => {
      updatedForm.forEach((updatedPlace) => {
        if (place.name == updatedPlace.value) {
          if (place.selectedBy?.length == 0) {
            if (updatedPlace.checked == true) {
              temp.places[pindex].selectedBy?.push({
                cid: companyId,
                destination: destinationCity,
              });
            }
          }
          const selectedDestinations = place.selectedBy?.map(
            (cur) => cur.destination
          );
          place.selectedBy?.forEach((selected, sindex) => {
            if (
              selected.cid == companyId &&
              updatedPlace.checked == true &&
              selected.destination == destinationCity
            ) {
            } else if (
              selected.cid == companyId &&
              updatedPlace.checked == false &&
              selected.destination == destinationCity
            ) {
              temp.places[pindex].selectedBy?.splice(sindex, 1);
            } else if (
              place.selectedBy?.length == sindex + 1 &&
              updatedPlace.checked == true &&
              !selectedDestinations?.includes(destinationCity)
            ) {
              temp.places[pindex].selectedBy?.push({
                cid: companyId,
                destination: destinationCity,
              });
            } else {
            }
          });
        }
      });
    });
    type == 'SP' ? (this.SP = temp) : (this.RSP = temp);
    this.db.list('starting_places').update(temp.key!, temp);
  }

  setDestination() {
    const companyId = this.memory.getCompanyId();
    const ref = this.db.database.ref('company/' + companyId + '/place');
    ref.on('value', (snapshot) => {
      this.Destinations = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          const temp: string = snapshot.val()[key].destination;
          this.Destinations.push(temp);
        }
      }
      this.destinationList.next(this.Destinations);
    });
  }

  tripBetweenDateValidator(
    busNo: string,
    gDate: string,
    rDate: string
  ): { isValidated: boolean; message: string } {
    let isValidated = true;
    let message = '';
    const onTrip = this.Buses.filter((bus) => bus.busNo == busNo).map(
      (bus) => bus.onTrip
    )[0];
    const goingDate = new Date(gDate);
    const returningDate = new Date(rDate);

    onTrip.forEach((cur) => {
      const tripDate = new Date(cur.date);
      if (goingDate < tripDate && tripDate < returningDate) {
        isValidated = false;
        message = `Bus No. ${busNo} Have Another Trip On ${cur.date}. ThereFore you Must schedule the returning Date Before Pre Scheduled Trip Date!!`;
      }
    });
    return { isValidated, message };
  }

  onTripValidationforReturnTrip(
    // ! this method must be called from componenet when the switch clicked and when admin change returning trip date
    busNo: string,
    date: string, // ! always must be returning trip date
    startingCity: string,
    destinationCity: string
  ): { isValidated: boolean; message: string } {
    let isValidated = true;
    let message = '';

    const onTrip = this.Buses.filter((bus) => bus.busNo == busNo).map(
      (bus) => bus.onTrip
    )[0];
    const fetchedDate = date.split('/');
    onTrip.forEach((cur) => {
      const dateArr = cur.date.split('/');
      const nextDateTripCondition =
        new Date(
          new Date().setDate(new Date(date).getDate() + 1)
        ).toLocaleDateString() == new Date(cur.date).toLocaleDateString();
      const previousDateTripCondition =
        new Date(
          new Date().setDate(new Date(date).getDate() - 1)
        ).toLocaleDateString() == new Date(cur.date).toLocaleDateString();
      const tripIndex = this.Trips.findIndex((trip) => trip.key == cur.tid);
      const trip = this.fetchTripDetail(tripIndex);
      if (date == cur.date) {
        isValidated = false;
        message = `Bus No. ${busNo} Registered For Trip On ${this.Trips[tripIndex].date} From: ${this.Trips[tripIndex].startingCity} To: ${this.Trips[tripIndex].destinationCity} - - - The Bus Is Not Available On Selected Date! Please Select Another Date`;
      } else if (nextDateTripCondition) {
        // const tripIndex = this.Trips.findIndex((trip) => trip.key == cur.tid);
        // const trip = this.fetchTripDetail(tripIndex);
        isValidated = trip.startingCity == destinationCity ? true : false;
        console.log(date);
        console.log(trip.startingCity);
        console.log(destinationCity);
        console.log(isValidated);
        message =
          trip.startingCity == destinationCity
            ? ''
            : `Bus No. ${busNo} Registered For Trip On ${this.Trips[tripIndex].date} From: ${this.Trips[tripIndex].startingCity} To: ${this.Trips[tripIndex].destinationCity} - - - The Bus Is Available On Selected Date But It Will has Another Trip On The Next Date ThereFore The Bus Must Be used For Trip To ${this.Trips[tripIndex].startingCity} Only!`;
      } else if (previousDateTripCondition) {
        // const tripIndex = this.Trips.findIndex((trip) => trip.key == cur.tid);
        // const trip = this.fetchTripDetail(tripIndex);
        isValidated = trip.destinationCity == startingCity ? true : false;
        message =
          trip.destinationCity == startingCity
            ? ''
            : `Bus No. ${busNo} Registered For Trip On ${this.Trips[tripIndex].date} From: ${this.Trips[tripIndex].startingCity} To: ${this.Trips[tripIndex].destinationCity} - - - The Bus Is Available On Selected Date But It Had Another Trip On The Day Before The Selected Date ThereFore The Bus Must Be used For Trip From: ${this.Trips[tripIndex].destinationCity} Only!`;
      } else {
      }
    });
    return { isValidated, message };
  }

  setBuses(date: string) {
    const companyId = this.memory.getCompanyId();
    const ref = this.db.database.ref('company/' + companyId + '/bus');
    ref.on('value', (snapshot) => {
      this.Buses = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: BusModel;
          temp = snapshot.val()[key];
          temp.key = key;
          temp.onTrip = temp.onTrip ? temp.onTrip : [];
          // if (!temp.onTrip) { // ! do the date validation here
          console.log('date');
          const onTripValidator = temp.onTrip.filter((cur) => {
            const tripDate = new Date(date);
            const dateArr = date.split('/');
            dateArr[1] = (parseInt(dateArr[1]) + 1).toString();
            const tripNextDate = new Date(dateArr.join('/'));
            dateArr[1] = (parseInt(dateArr[1]) - 2).toString();
            const tripPreviousDate = new Date(dateArr.join('/'));
            const busTripDate = new Date(cur.date);
            // console.log(tripDate);
            // console.log(tripNextDate);
            // console.log(busTripDate);
            // console.log(busTripDate > tripDate);
            // console.log(busTripDate.toString() == tripNextDate.toString());
            if (busTripDate.toString() == tripDate.toString()) {
              console.log('if clause');
              return cur;
            } else if (
              busTripDate > tripDate &&
              busTripDate.toString() == tripNextDate.toString()
            ) {
              console.log('if else');
              const tripIndex = this.Trips.findIndex(
                (trip) => trip.key == cur.tid
              );
              const message = `Bus No. ${temp.busNo} Registered For Trip On ${this.Trips[tripIndex].date} From: ${this.Trips[tripIndex].startingCity} To: ${this.Trips[tripIndex].destinationCity} - - - The Bus Is Available On Selected Date But It Will has Another Trip On The Next Date ThereFore The Bus Must Be used For Trip To ${this.Trips[tripIndex].startingCity} Only!`;
              this.BusSelectionMessage.next({
                message,
                busNo: temp.busNo,
              });
              return;
            } else if (
              busTripDate > tripDate &&
              busTripDate.toString() == tripPreviousDate.toString()
            ) {
              console.log('if else');
              const tripIndex = this.Trips.findIndex(
                (trip) => trip.key == cur.tid
              );
              const message = `Bus No. ${temp.busNo} Registered For Trip On ${this.Trips[tripIndex].date} From: ${this.Trips[tripIndex].startingCity} To: ${this.Trips[tripIndex].destinationCity} - - - The Bus Is Available On Selected Date But It Had Another Trip On The Day Before The Selected Date ThereFore The Bus Must Be used For Trip From: ${this.Trips[tripIndex].destinationCity} Only!`;
              this.BusSelectionMessage.next({
                message,
                busNo: temp.busNo,
              });
              return;
            } else {
              return;
            }
            // cur.date == date;
          });
          if (onTripValidator.length == 0) {
            this.Buses.push(temp);
          }
          // }
        }
      }

      this.busList.next(this.Buses);
    });
  }

  setSP(city: string, type: string) {
    this.city = city;
    this.type = type;
    const ref = this.db.database.ref('starting_places');
    ref
      .orderByChild('city')
      .equalTo(this.city)
      .on('value', (snapshot) => {
        console.log('firebase fetching working!!');
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            let temp: SPModel;
            temp = snapshot.val()[key];
            temp.key = key;
            temp.places.forEach((cur, index) => {
              temp.places[index].selectedBy = cur.selectedBy
                ? cur.selectedBy
                : [];
            });
            this.type == 'SP' ? (this.SP = temp) : (this.RSP = temp);
          }
        }
        this.type == 'SP'
          ? this.SPList.next(this.SP)
          : this.RSPList.next(this.RSP);
      });
  }

  addSP(cityName: string, start: string) {
    const place = { name: start, selectedBy: [] };
    const ref = this.db.database.ref('starting_places');
    ref
      .orderByChild('city')
      .equalTo(cityName)
      .once('value', (snapshot) => {
        if (snapshot.val()) {
          let temp;
          for (const key in snapshot.val()) {
            if (snapshot.val().hasOwnProperty(key)) {
              temp = snapshot.val()[key];
              if (temp.places) {
                temp.places.push(place);
              } else {
                temp.places = [place];
              }
            }
            this.db.list('starting_places').update(key, temp);
          }
        } else {
          this.db.list('starting_places').push({
            city: cityName,
            places: [place],
          });
        }
      });
  }

  addTrip(newTrip: TripModel, date: string) {
    const companyId = this.memory.getCompanyId();
    newTrip.passengers = [];
    newTrip.key = null!;
    newTrip.status = [false, false];
    return this.db
      .list('trip')
      .push(newTrip)
      .then((response) => {
        const selectedBus = this.Buses.filter(
          (bus) => bus.busNo == newTrip.busNo
        )[0];
        const onTripValue = new onTrip(
          response.key!,
          new Date(date).toLocaleDateString()
        );
        selectedBus.onTrip.push(onTripValue);
        this.db
          .list('company/' + companyId + '/bus')
          .update(selectedBus.key!, selectedBus);
      });
  }

  validateSeatReservation() {
    setInterval(() => {
      const currentHour = parseInt(
        new Date().toLocaleTimeString().split(':')[0]
      );
      this.Trips.forEach((trip) =>
        trip.passengers.forEach((passenger) => {
          if (passenger.status != 'sold') {
            const timeChange =
              currentHour - parseInt(passenger.time.split(':')[0]);

            if (timeChange > 1) {
              // todo perform delete operation
              // console.log(passenger);

              this.db
                .list('trip/' + trip.key + '/passengers')
                .remove(passenger.key);
            }
          }
        })
      );
    }, 30000);
  }

  // companyId
  setTrips() {
    const companyId = this.memory.getCompanyId();
    // this.Trips = [];
    const ref = this.db.database.ref('trip');
    return ref
      .orderByChild('companyId')
      .equalTo(companyId)
      .on('value', (snapshot) => {
        this.Trips = [];
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            let temp: TripModel;
            temp = snapshot.val()[key];
            temp.key = key;
            if (temp.passengers) {
              const passengers: PassengerModel[] = [];
              for (const key in temp.passengers) {
                if (temp.passengers.hasOwnProperty(key)) {
                  let passTemp: PassengerModel;
                  passTemp = temp.passengers[key];
                  passTemp.key = key;
                  passTemp.bookingMethod = passTemp.bookingMethod
                    ? passTemp.bookingMethod
                    : 'App';
                  passTemp.startingPlace = passTemp.startingPlace
                    .toString()
                    .split(' / ');
                  passengers.push(passTemp);
                }
              }
              temp.passengers = passengers;
            } else {
              temp.passengers = [];
            }
            // temp.passengers = temp.passengers ? temp.passengers : [];
            this.Trips.push(temp);
          }
        }
        this.Trips.sort((a, b) => {
          const x = a.date.split(' / ')[1];
          const y = b.date.split(' / ')[1];
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
        this.tripsList.next(this.Trips);
      });
  }

  setAllTrips() {
    // this.Trips = [];
    const ref = this.db.database.ref('trip');
    return ref.on('value', (snapshot) => {
      this.Trips = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: TripModel;
          temp = snapshot.val()[key];
          temp.key = key;
          if (temp.passengers) {
            const passengers: PassengerModel[] = [];
            for (const key in temp.passengers) {
              if (temp.passengers.hasOwnProperty(key)) {
                let passTemp: PassengerModel;
                passTemp = temp.passengers[key];
                passTemp.key = key;
                passTemp.bookingMethod = passTemp.bookingMethod
                  ? passTemp.bookingMethod
                  : 'App';
                passTemp.startingPlace = passTemp.startingPlace
                  .toString()
                  .split(' / ');
                passengers.push(passTemp);
              }
            }
            temp.passengers = passengers;
          } else {
            temp.passengers = [];
          }
          // temp.passengers = temp.passengers ? temp.passengers : [];
          this.Trips.push(temp);
        }
      }
      this.Trips.sort((a, b) => {
        const x = a.date.split(' / ')[1];
        const y = b.date.split(' / ')[1];
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      });
      this.tripsList.next(this.Trips);
    });
  }
}
