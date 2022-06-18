import { BuyTicketService } from './../../services/buy-ticket.service';
import { TripService } from './../../services/trip.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-passenger-detail',
  templateUrl: './passenger-detail.component.html',
  styleUrls: ['./passenger-detail.component.css'],
})
export class PassengerDetailComponent implements OnInit {
  validateForm!: FormGroup;
  seatPreview = false;
  seats: number[] = [];
  startingPlaces: any[] = [];

  availableSeats(side: number) {
    this.seatPreview = true;
    this.seats = [];
    for (let seat = side; seat < 45; seat += 4) {
      this.seats.push(seat);
    }

    if (side == 1) {
      this.seats.push(45);
    } else if (side == 2) {
      this.seats.push(46);
    } else if (side == 3) {
      this.seats.push(48);
    } else if (side == 4) {
      this.seats.push(49);
    } else {
      this.seats = [];
      this.seats.push(47);
    }
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const formValue = this.validateForm.value;
      this.buyTicketService.setpassangerDetail(
        formValue.fullName,
        formValue.phoneNumber,
        formValue.seat,
        formValue.startingPlace[0]
      );
      this.routes.navigate(['../../payment_methods'], {
        relativeTo: this.route,
      });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private routes: Router,
    private route: ActivatedRoute,
    private tripService: TripService,
    private buyTicketService: BuyTicketService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params.key;
    this.startingPlaces = this.tripService.fetchSP(id)!;
    if (!this.startingPlaces.length || !this.startingPlaces[0]) {
      this.routes.navigate(['home']);
    }
    this.validateForm = this.fb.group({
      fullName: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required]],
      seat: [null, [Validators.required]],
      startingPlace: ['', [Validators.required]],
      terms: [true],
    });
  }
}
