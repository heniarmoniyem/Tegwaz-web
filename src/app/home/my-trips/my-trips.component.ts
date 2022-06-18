import { BuyTicketService } from './../../services/buy-ticket.service';
import { MessageService } from './../../services/message.service';
import { TripService } from './../../services/trip.service';
import { MyTripService } from './../../services/my-trip.service';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface myTripsModel {
  tripId: string;
  passangerId: string;
  startingCity: string;
  destinationCity: string;
  date: string;
  passengerName: string;
  phoneNo: string;
  seatNo: string;
  departurePlace: string;
}
@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.component.html',
  styleUrls: ['./my-trips.component.css'],
})
export class MyTripsComponent implements OnInit {
  Trips: myTripsModel[] = [];

  constructor(
    private myTripService: MyTripService,
    private buyTicketService: BuyTicketService,
    private messageService: MessageService
  ) {}

  onCancelTrip(tripId: string, passengerId: string) {
    this.buyTicketService.cancelTrip(passengerId, tripId).then(() => {
      this.Trips = this.myTripService.fetch();
      this.messageService.createMessage(
        'success',
        'Trip Canceled Successfully!'
      );
    });
  }

  ngOnInit(): void {
    this.Trips = this.myTripService.fetch();
  }
}
