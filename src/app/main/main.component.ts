import { AdminAccountService } from './../services/admin-account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PlaceCrudService } from './../services/place.crud.service';
import { PlaceCrudComponent } from './place-crud/place-crud.component';
import { TripService } from './../services/trip.service';
import { EmployeAccountService } from './../services/employe-account.service';
import { MemoryService } from './../services/memory.service';
import { BusCrudService } from 'src/app/services/bus.crud.service';
import { Auth } from './../services/auth.service';
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  isCollapsed = false;
  role: string;
  date: string;
  time: string;

  constructor(
    private auth: Auth,
    private busService: BusCrudService,
    private employeService: EmployeAccountService,
    private TripService: TripService,
    private placeService: PlaceCrudService,
    private memory: MemoryService,
    private adminService: AdminAccountService,
    private routes: Router,
    private route: ActivatedRoute
  ) {
    this.dateTimeCounter();
  }

  ngOnInit(): void {
    this.role = this.memory.getRole();

    if (this.role == 'Admin') {
      this.busService.setBuses();
      this.employeService.setEmployees();
      this.TripService.setTrips();
      this.TripService.validateSeatReservation();
      this.placeService.setPlaces();
      this.busService.setDrivers();
      this.routes.navigate(['trip/list'], { relativeTo: this.route });
    } else if (this.role == 'Ticket Seller') {
      this.busService.setBuses();
      this.TripService.setTrips();
      this.routes.navigate(['trip/list'], { relativeTo: this.route });
    } else if (this.role == 'Super Admin') {
      this.adminService.setAdmins();
      this.routes.navigate(['view_Admin_Account'], { relativeTo: this.route });
    } else if (this.role == 'Driver') {
    } else {
      this.routes.navigate(['../page-not-found']);
    }
  }

  navigateToLogin() {
    // todo navigate to driver page until that let us go to login system
    this.onLogout();
    this.routes.navigate(['../..'], { relativeTo: this.route });
  }

  dateTimeCounter() {
    setInterval(() => {
      this.date = new Date().toLocaleDateString();
      this.time = new Date().toLocaleTimeString();
    }, 1000);
  }

  onLogout() {
    this.auth.logout();
  }
}
