import { Router } from '@angular/router';
import { MessageService } from './../../services/message.service';
import { PaymentService } from './../../services/payment.service';
import { BuyTicketService } from './../../services/buy-ticket.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  isVisible = false;
  isPDVisible = false;
  imgSrc = '';
  validateForm!: FormGroup;
  pin = '';
  pinSubmitted = false;

  paymentSelected(imageStr: string) {
    this.imgSrc = imageStr;
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }

  handlePDOk(): void {
    this.pinSubmitted = true;
    // todo send the pin to the back end
    if (this.pin == '') {
      this.messageService.createMessage(
        'error',
        'Empty Pin Field!! please insert your pin!'
      );
      return;
    }

    const price = this.buyTicketService.getPrice();
    if (!this.paymentService.hasCorrectPin(this.pin)) {
      this.messageService.createMessage(
        'error',
        'Incorrect Pin!! please try again!'
      );
      return;
    }

    if (!this.paymentService.hasEnoughtMoney(price)) {
      this.messageService.createMessage(
        'error',
        'The Account Has No Enough Money!!'
      );
      this.isPDVisible = false;
      return;
    }

    this.paymentService.pay(price);
    // todo first check then pay
  }

  handlePDCancel(): void {
    console.log('Button cancel clicked!');
    this.isPDVisible = false;
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.paymentService.searchAccount(
        this.validateForm.value.fullName,
        this.validateForm.value.phoneNumber,
        this.validateForm.value.accountNumber
      );
      this.buyTicketService.testPassangerInfo();
      this.isPDVisible = true;
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
    private paymentService: PaymentService,
    private buyTicketService: BuyTicketService,
    private messageService: MessageService,
    private routes: Router
  ) {}

  ngOnInit(): void {
    this.paymentService.successPaymentListener.subscribe((response) => {
      if (response) {
        this.buyTicketService.buyTicket().then(() => {
          (this.pin = ''), (this.isPDVisible = false);
          this.isVisible = false;
          // todo reset payment
          this.paymentService.resetData();
          this.buyTicketService.resetPassangerInfo();
          this.messageService.createMessage(
            'success',
            'Ticket Booked Successfully!!'
          );
          this.routes.navigate(['home/my_trips']);
          // todo reset trip
          // todo display success message
          // todo redirect to my-trips page
        });
      }
    });
    this.validateForm = this.fb.group({
      fullName: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required]],
      accountNumber: [null, [Validators.required]],
      pin: ['1000085', [Validators.required]],
    });
  }
}
