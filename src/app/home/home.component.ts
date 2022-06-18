import { AdminAccountService } from 'src/app/services/admin-account.service';
import { TripService } from './../services/trip.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  redirectToLogin() {
    this.routes.navigate(['../login']);
  }

  constructor(
    private routes: Router,
    private route: ActivatedRoute,
    private tripService: TripService,
    private adminService: AdminAccountService
  ) {}

  ngOnInit(): void {
    this.tripService.tripsList.subscribe((response) => {
      console.log(response);
    });

    if (!this.tripService.checkTrips()) {
      this.routes.navigate(['home']);
    }
    this.tripService.setAllTrips();
    this.adminService.setAdmins();
  }
}
