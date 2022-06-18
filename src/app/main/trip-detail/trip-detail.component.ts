import { MemoryService } from './../../services/memory.service';
import { SellTicketService } from './../../services/sell-ticket.service';
import { BusCrudService } from 'src/app/services/bus.crud.service';
import { TripService } from './../../services/trip.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TripModel } from 'src/app/models/trip.model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

// interface ItemData {
//   name: string;
//   age: number;
//   address: string;
// }
@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css'],
})

export class TripDetailComponent implements OnInit {
  customStyle: {
    background: '#f7f7f7';
    'border-radius': '4px';
    'margin-bottom': '24px';
    border: '0px';
  };
  // listOfData: ItemData[] = [];
  tripDetail: TripModel;
  id: number;
  busTotalSeatNo: any;
  isVisible = false;
  validateForm!: FormGroup;
  availableSeats: number[] = [];
  seatSimulatorcheck = 0;
  seatRow = 'No Seat Number Selected';
  employeeID = this.memory.getEmployeeId();
  role: string;

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      this.ticketSellingService
        .sellTicket(
          this.tripDetail.key!,
          this.validateForm.value.fullName,
          this.validateForm.value.phoneNo,
          this.validateForm.value.seatNo,
          this.validateForm.value.startingPlace
        )
        .then(() => {
          this.isVisible = false;
          this.validateForm.reset();
        });
    }
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  private fetchAndSetTrip() {
    this.tripDetail = this.tripService.fetchTripDetail(this.id);
    if (this.tripDetail) {
      this.busTotalSeatNo = this.busService.fetchBusSeatNo(
        this.tripDetail.busNo
      );

      this.availableSeats = [];
      for (let index = 1; index <= this.busTotalSeatNo; index++) {
        this.availableSeats.push(index);
      }

      this.tripDetail.passengers
        .map((pass) => pass.seatNo)
        .forEach((pass) => {
          const index = this.availableSeats.indexOf(pass);
          this.availableSeats.splice(index, 1);
        });
    }
  }

  seatSimulator() {
    const seatNo = this.validateForm.value.seatNo;
    const seatControl = this.validateForm.controls.seatNo.valid;
    if (!seatControl) {
      this.seatSimulatorcheck = 0;
      this.seatRow = 'Selected Seat No Is Not Available';
      return;
    }
    const calcRow = (seatNo / 4 + 0.25).toFixed(0);

    this.seatRow = 'Selected Seat No Found At Row No - ' + calcRow;
    if (this.busTotalSeatNo - seatNo < 5) {
      if (this.busTotalSeatNo - seatNo == 4) {
        this.seatSimulatorcheck = 1;
      } else if (this.busTotalSeatNo - seatNo == 3) {
        this.seatSimulatorcheck = 2;
      } else if (this.busTotalSeatNo - seatNo == 2) {
        this.seatSimulatorcheck = 5;
      } else if (this.busTotalSeatNo - seatNo == 1) {
        this.seatSimulatorcheck = 3;
      } else {
        this.seatSimulatorcheck = 4;
      }
    } else {
      if (seatNo % 4 == 0) {
        this.seatSimulatorcheck = 4;
      } else if (seatNo % 4 == 3) {
        this.seatSimulatorcheck = 3;
      } else if (seatNo % 4 == 2) {
        this.seatSimulatorcheck = 2;
      } else {
        this.seatSimulatorcheck = 1;
      }
    }
  }

  private seatValidator(control: FormControl) {
    const value = control.value;
    if (value > this.busTotalSeatNo || !this.availableSeats.includes(value)) {
      return { error: '' };
    }
    return null;
  }

  cancelTrip(passengerId: string) {
    this.ticketSellingService
      .cancelTrip(passengerId, this.tripDetail.key!)
      .then(() => {
        // todo delete message here
      });
  }

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private routes: Router,
    private busService: BusCrudService,
    private fb: FormBuilder,
    private ticketSellingService: SellTicketService,
    private memory: MemoryService
  ) {}

  ngOnInit(): void {
    this.role = this.memory.getRole();

    this.tripService.tripsList.subscribe(() => {
      this.fetchAndSetTrip();
    });

    this.id = this.route.snapshot.params.id;
    this.fetchAndSetTrip();
    if (!this.tripDetail) {
      this.routes.navigate(['../../../trip/list'], { relativeTo: this.route });
    }

    this.validateForm = this.fb.group({
      fullName: [null, [Validators.required]],
      phoneNo: [null, [Validators.required]],
      seatNo: [null, [Validators.required, this.seatValidator.bind(this)]],
      startingPlace: ['', [Validators.required]],
    });
  }
}
