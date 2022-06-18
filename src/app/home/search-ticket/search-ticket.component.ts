import { BuyTicketService } from './../../services/buy-ticket.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { differenceInCalendarDays, setHours } from 'date-fns';

@Component({
  selector: 'app-search-ticket',
  templateUrl: './search-ticket.component.html',
  styleUrls: ['./search-ticket.component.css'],
})
export class SearchTicketComponent implements OnInit {
  validateForm!: FormGroup;
  today = new Date();
  places = [
    'Addis Ababa',
    'Mekelle',
    'Gondar',
    'Adama',
    'Awassa',
    'BahirDar',
    'DireDawa',
    'Sodo',
    'Dessie',
    'Jimma',
    'Jijiga',
    'Shashamane',
    'Bishoftu',
    'Arba Minch',
    'Hosaena',
    'Harar',
    'Dilla',
    'Nekemte',
    'Debre Birhan',
    'Asella',
    'Debre Markos',
    'Kombolcha',
    'Debre Tabor',
    'Adigrat',
    'Weldiya',
    'Areka',
    'Sebeta',
    'Burayu',
    'Shire',
    'Ambo',
    'Arsi Negele',
    'Aksum',
    'Gambela',
    'Bale Robe',
    'Butajira',
    'Batu',
    'Boditi',
    'Adwa',
    'Yirgalem',
    'Waliso',
    'Welkite',
    'Gode',
    'Meki',
    'Negele Borana',
    'Alaba Kulito',
    'Alamata',
    'Chiro',
    'Tepi',
    'Durame',
    'Goba',
    'Assosa',
    'Gimbi',
    'Wukro',
    'Haramaya',
    'Mizan Teferi',
    'Sawla',
    'Mojo',
    'DembiDolo',
    'Metu',
    'Mota',
    'Fiche',
    'Finote Selam',
    'Bule Hora',
    'Bonga',
    'Kobo',
    'Jinka',
    'Dangila',
    'Degehabur',
    'Dimtu',
    'Agaro',
  ].sort(function(a, b) {
    if (a < b) {
      return -1;
    }
    if (b < a) {
      return 1;
    }
    return 0;
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
      const formValue = this.validateForm.value;
      this.buyTicketService.filterTrips(
        formValue.startingCity[0],
        formValue.destinationCity[0],
        formValue.date
      );
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  disabledDate = (current: Date): boolean =>
    differenceInCalendarDays(current, this.today) < 0

  constructor(
    private fb: FormBuilder,
    private buyTicketService: BuyTicketService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      startingCity: ['', [Validators.required]],
      destinationCity: ['', [Validators.required]],
      date: [null, [Validators.required]],
    });
  }
}
