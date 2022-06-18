import { AngularFireDatabase } from '@angular/fire/database';
import { TripService } from './trip.service';
import { TripModel } from 'src/app/models/trip.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BuyTicketService {
  filteredTrips: TripModel[] = [];
  filteredTripsList = new Subject<TripModel[]>();
  passangerInfo = {
    tripId: '',
    fullName: '',
    phoneNo: '',
    seatNo: '',
    startingPlace: '',
    price: 0,
  };

  resetPassangerInfo() {
    this.passangerInfo = {
      tripId: '',
      fullName: '',
      phoneNo: '',
      seatNo: '',
      startingPlace: '',
      price: 0,
    };
  }

  testPassangerInfo() {
    console.log('passanger detai', this.passangerInfo);
  }

  setTripsInfo(id: string, price: number) {
    this.passangerInfo.tripId = id;
    this.passangerInfo.price = price;
  }

  setpassangerDetail(
    fullName: string,
    phoneNo: string,
    seatNo: string,
    startingPlace: string
  ) {
    this.passangerInfo.fullName = fullName;
    this.passangerInfo.phoneNo = phoneNo;
    this.passangerInfo.seatNo = seatNo;
    this.passangerInfo.startingPlace = startingPlace;
  }

  getPrice() {
    return this.passangerInfo.price;
  }

  filterTrips(startingCity: string, destinationCity: string, date: string) {
    const trips = this.tripService.retrieveTrips();
    const formatedDate = new Date(date).toDateString();
    startingCity = startingCity.toLowerCase();
    destinationCity = destinationCity.toLowerCase();
    this.filteredTrips = trips.filter((trip) => {
      const tripFormatedDate = new Date(
        trip.date.split(' / ')[0]
      ).toDateString();
      return (
        trip.startingCity.split(' / ')[0].toLowerCase() == startingCity &&
        trip.destinationCity.split(' / ')[0].toLowerCase() == destinationCity &&
        formatedDate == tripFormatedDate &&
        trip.passengers.length < 49
      );
    });

    this.filteredTripsList.next(this.filteredTrips);
  }

  buyTicket() {
    return this.db
      .list('trip/' + this.passangerInfo.tripId + '/passengers')
      .push({
        date: new Date().toLocaleDateString(),
        deviceId: '0',
        fullName: this.passangerInfo.fullName,
        phoneNo: this.passangerInfo.phoneNo,
        seatNo: this.passangerInfo.seatNo,
        startingPlace: this.passangerInfo.startingPlace,
        status: 'sold',
        time: new Date().toLocaleTimeString(),
        // bookingMethod: employeeId,
        // todo must save trip data on local storage
      })
      .then((response) => {
        let tripsData: {
          tripId: string;
          passangerId: String;
        }[] = [];

        const temp = JSON.parse(localStorage.getItem('myTrips')!);
        if (temp) {
          tripsData = temp;
        }

        const newTripData = {
          tripId: this.passangerInfo.tripId,
          passangerId: response.key!,
        };

        // if (tripsData.length) {
        tripsData.unshift(newTripData);
        // } else {

        // }

        localStorage.setItem('myTrips', JSON.stringify(tripsData));
      });
  }

  cancelTrip(key: string, tripId: string) {
    const temp = JSON.parse(localStorage.getItem('myTrips')!);
    const updatedData = temp.filter((data: any) => {
      if (data.tripId == tripId && data.passangerId == key) {
        return;
      } else {
        return data;
      }
    });
    localStorage.setItem('myTrips', JSON.stringify(updatedData));
    return this.db.list('trip/' + tripId + '/passengers').remove(key);
  }

  constructor(
    private tripService: TripService,
    private db: AngularFireDatabase
  ) {}
}
