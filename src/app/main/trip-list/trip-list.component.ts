import { BusCrudService } from 'src/app/services/bus.crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TripService } from './../../services/trip.service';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TripModel } from 'src/app/models/trip.model';

interface displayTrip {
  busNo: string;
  date: string[];
  destinationCity: string[];
  driver: string;
  startingCity: string[];
  availableSeats: number;
  totalSeatNo: number;
}

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css'],
})
export class TripListComponent implements OnInit {
  switchValue = false;
  languageIndex = 0;
  trips: displayTrip[] = [];

  switchChange() {
    this.switchValue ? (this.languageIndex = 1) : (this.languageIndex = 0);
  }

  viewDetail(index: number) {
    this.routes.navigate(['../../' + index + '/trip/detail'], {
      relativeTo: this.route,
    });
  }

  constructor(
    private tripsService: TripService,
    private busService: BusCrudService,
    private routes: Router,
    private route: ActivatedRoute
  ) {}

  private tripSetter(response: TripModel[]) {
    this.trips = [];
    response.forEach((curTrip) => {
      const totalSeatNo = this.busService.fetchBusSeatNo(curTrip.busNo);
      this.trips.push({
        busNo: curTrip.busNo,
        date: curTrip.date.split(' / '),
        destinationCity: curTrip.destinationCity.split(' / '),
        driver: curTrip.driver,
        startingCity: curTrip.startingCity.split(' / '),
        availableSeats: totalSeatNo - curTrip.passengers.length,
        totalSeatNo,
      });
    });
  }

  ngOnInit(): void {
    this.tripSetter(this.tripsService.retrieveTrips());
    this.tripsService.tripsList.subscribe((response) => {
      this.tripSetter(response);
    });
    this.tripsService.setTrips();
  }
}
