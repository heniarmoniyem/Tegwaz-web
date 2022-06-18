import { TripModel } from './../../models/trip.model';
import { MemoryService } from './../../services/memory.service';
import { BusModel } from './../../models/bus.model';
import { TripService } from './../../services/trip.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

const ethDateTime = require('ethiopian-calendar-date-converter');

interface check {
  label: string;
  value: string;
  checked?: boolean;
  disabled: boolean;
}

interface Notification {
  message: string;
  busNo: string;
}

@Component({
  selector: 'app-trip-operation',
  templateUrl: './trip-operation.component.html',
  styleUrls: ['./trip-operation.component.css'],
})
export class TripOperationComponent implements OnInit {
  companyId: string = this.memory.getCompanyId();
  SPForm: FormGroup;
  returnForm: FormGroup;
  Form: FormGroup;
  citiesList: string[] = [];
  busesList: BusModel[] = [];
  isLoading = false;
  returningTrip = false;
  SPList: check[] = [];
  returnSPList: check[] = [];
  driversList: string[];
  isModalVisible = false;
  selectedDriver = '';
  startingPlace: string[] = [];
  returnStartingPlace: string[] = [];
  notificationMessages: Notification[] = [];

  showDriversModal(): void {
    this.selectedDriver = '';
    if (this.Form.value.busNo != '') {
      this.tripService.returnDrivers(this.Form.value.busNo);
    }
  }

  handleOk(): void {
    if (this.selectedDriver == '') {
      this.message.create('error', `Please select one driver!!`);
      return;
    }
    this.isModalVisible = false;
  }

  handleCancel(): void {
    this.Form.patchValue({ busNo: '' }), (this.isModalVisible = false);
  }

  log(tripType: string): void {
    if (tripType == 'firstTrip') {
      this.tripService.SPUpdate(
        this.SPList,
        'SP',
        this.Form.value.destinationCity
      );
    }

    if (tripType == 'returnTrip') {
      this.tripService.SPUpdate(
        this.returnSPList,
        'RSP',
        this.returnForm.getRawValue().destinationCity
      );
    }
  }

  SPchanged() {
    const start = this.Form.value.startingCity;
    const destination = this.Form.value.destinationCity;
    if (start && destination) {
      this.tripService.setSP(start, 'SP');
    }
  }

  RSPchanged() {
    const start = this.returnForm.getRawValue().startingCity;
    const destination = this.returnForm.getRawValue().destinationCity;
    // console.log(this.returnForm.getRawValue().startingCity);
    if (start && destination) {
      this.tripService.setSP(start, 'RSP');
    }
  }

  submitSPForm() {
    for (const i in this.SPForm.controls) {
      this.SPForm.controls[i].markAsDirty();
      this.SPForm.controls[i].updateValueAndValidity();
    }

    if (this.SPForm.valid) {
      const start =
        this.SPForm.value.start + ' / ' + this.SPForm.value.amharicStart;
      const city = this.SPForm.value.city;
      this.tripService.addSP(city, start);
      this.SPForm.reset();
      // .then(() => {
      //   this.message.create(
      //     'success',
      //     `'${start}' was added to '${city}' Trip starting places`
      //   );
      // });
    }
  }

  private FormValidator(): Boolean[] {
    for (const i in this.Form.controls) {
      this.Form.controls[i].markAsDirty();
      this.Form.controls[i].updateValueAndValidity();
    }

    if (this.returningTrip) {
      for (const i in this.returnForm.controls) {
        this.returnForm.controls[i].markAsDirty();
        this.returnForm.controls[i].updateValueAndValidity();
      }
    }

    if (this.Form.invalid) {
      return [false, false];
    }

    // starting place validation
    this.startingPlace = [];
    this.SPList.forEach((cur) => {
      if (cur.checked) {
        this.startingPlace.push(cur.value);
      }
    });

    // starting and destination must not be the same
    if (this.Form.value.startingCity == this.Form.value.destinationCity) {
      this.Form.patchValue({ destinationCity: '' });
      this.message.create(
        'error',
        `Please select different initial and destination city!!`
      );
      return [false, false];
    }
    // past date Validator
    if (new Date(this.Form.value.date) <= new Date()) {
      this.Form.patchValue({ date: null });
      this.message.create('error', `Please select future date!!`);
      return [false, false];
    }

    if (this.startingPlace.length == 0) {
      this.message.create(
        'error',
        `Please select at least one starting place!!`
      );
      return [false, false];
    }

    const busIsAvailableForSelectedDate = this.busesList.filter(
      (bus) => bus.busNo == this.Form.value.busNo
    ).length;
    if (busIsAvailableForSelectedDate < 1) {
      this.message.create(
        'error',
        `Please select Bus Which Is Available On ${new Date(
          this.Form.value.date
        ).toLocaleDateString()}!!`
      );
      return [false, false];
    }

    if (this.returningTrip) {
      const returnValues = this.returnForm.getRawValue();
      this.returnStartingPlace = [];
      this.returnSPList.forEach((cur) => {
        if (cur.checked) {
          this.returnStartingPlace.push(cur.value);
        }
      });

      if (returnValues.startingCity != this.Form.value.destinationCity) {
        this.returnForm.reset();
        this.returningTrip = false;
        this.Form.patchValue({ destinationCity: null });
        this.message.create(
          'error',
          `First Trip Destination City & Returning Trip Starting City is Not The Same. Please Destination City!!`
        );
        return [false, false];
      }

      if (returnValues.destinationCity != this.Form.value.startingCity) {
        this.returnForm.reset();
        this.returningTrip = false;
        this.Form.patchValue({ startingCity: null });
        this.message.create(
          'error',
          `First Trip Starting City & Returning Trip Destination City is Not The Same. Please Destination City!!`
        );
        return [false, false];
      }

      if (returnValues.busNo != this.Form.value.busNo) {
        this.returnForm.reset();
        this.returningTrip = false;
        this.Form.patchValue({ busNo: null });
        this.message.create(
          'error',
          `the Bus No Must Be The Same For Both Trips. Please select Bus!!`
        );
        return [false, false];
      }

      if (new Date(returnValues.date) <= new Date(this.Form.value.date)) {
        this.returnForm.patchValue({ date: null });
        this.message.create(
          'error',
          `Please select future date for the returning trip!!`
        );
        return [false, false];
      }

      if (this.returnStartingPlace.length == 0) {
        this.message.create(
          'error',
          `Please select at least one starting place for the return place!!`
        );
        return [false, false];
      }

      const response = this.tripService.tripBetweenDateValidator(
        this.Form.value.busNo,
        this.Form.value.date,
        this.returnForm.value.date
      );
      console.log('validation return');
      console.log(response);
      if (!response.isValidated) {
        this.notification.warning('Unassigned Bus', response.message, {
          nzDuration: 0,
        });
        this.returnForm.patchValue({ date: null });
        return [false, false];
      }
      return [true, true];
    }
    const Validation = this.tripService.onTripValidationforReturnTrip(
      this.Form.value.busNo,
      new Date(this.Form.value.date).toLocaleDateString(),
      this.Form.value.startingCity,
      this.Form.value.destinationCity
    );

    if (!Validation.isValidated) {
      this.notification.info('Appointment Error', Validation.message, {
        nzDuration: 0,
      });
      this.Form.patchValue({ date: null });
      return [false, false];
    }
    return [true, false];
  }

  submitForm() {
    const isValidated = this.FormValidator();
    if (isValidated[0]) {
      if (isValidated[0] && isValidated[1]) {
        // this if is for return trip
        if (!this.returnDateValidator()) {
          return;
        }
        console.log('Validation Passed');
        const returnForm = this.returnForm.getRawValue();
        const convertedDate = this.dateConverter(returnForm.date.toString()); // this is the final coverted date
        const unformatedTime = new Date(
          this.returnForm.value.time
        ).toLocaleTimeString();
        const returnTime =
          unformatedTime.substr(0, 5) + ' ' + unformatedTime.substr(9, 2);
        const newReturnTrip = new TripModel(
          convertedDate,
          returnTime,
          returnForm.startingCity,
          returnForm.destinationCity,
          this.returnStartingPlace,
          this.selectedDriver,
          returnForm.busNo,
          this.companyId,
          [],
          [false, false]
        );
        this.tripService.addTrip(newReturnTrip, returnForm.date);
      }
      const convertedDate = this.dateConverter(this.Form.value.date); // this is the final coverted date
      const unformatedTime = new Date(
        this.Form.value.time
      ).toLocaleTimeString();
      const time =
        unformatedTime.substr(0, 5) + ' ' + unformatedTime.substr(9, 2);
      const newTrip = new TripModel(
        convertedDate,
        time,
        this.Form.value.startingCity,
        this.Form.value.destinationCity,
        this.startingPlace,
        this.selectedDriver,
        this.Form.value.busNo,
        this.companyId,
        [],
        [false, false]
      );
      // console.log(newTrip);
      this.tripService.addTrip(newTrip, this.Form.value.date).then((_) => {
        this.Form.reset();
        this.Form.setValue({
          date: null,
          time: 'Sun Feb 28 2021 10:00:48 GMT+0300 (Moscow Standard Time)',
          startingCity: '',
          destinationCity: '',
          busNo: '',
        });
        this.isModalVisible = false;
        this.selectedDriver = '';
        this.startingPlace = [];
        this.busesList = [];
        this.SPList = [];
        this.driversList = [];
        if (this.returningTrip) {
          this.returnForm.reset();
          this.returnStartingPlace = [];
          this.returningTrip = false;
        }
      });
    }
  }

  private dateConverter(date: string): string {
    let grigDate = date;
    let ethDate = ethDateTime.converterDateTime.toEthiopian(new Date(grigDate))
      .dateWithDayString;
    ethDate = ethDate.replace(/,/g, '');
    ethDate = ethDate.split(' ');
    const day = new Map([
      ['Monday', 'ሰኞ'],
      ['Tuesday', 'ማክሰኞ'],
      ['Wednesday', 'ረቡዕ'],
      ['Thursday', 'ሐሙስ'],
      ['Friday', 'አርብ'],
      ['Saterday', 'ቅዳሜ'],
      ['Sunday', 'እሁድ'],
    ]);

    const month = new Map([
      ['Meskerem', 'መስከረም'],
      ['Tikimt', 'ጥቅምት'],
      ['Hidar', 'ህዳር'],
      ['Tahsas', 'ታህሳስ'],
      ['Tir', 'ጥር'],
      ['Yekatit', 'የካቲት'],
      ['Megabit', 'መጋቢት'],
      ['Meyazya', 'ሚያዝያ'],
      ['Ginbot', 'ግንቦት'],
      ['Sene', 'ሰኔ'],
      ['Hamle', 'ሐምሌ'],
      ['Nehase', 'ነሃሴ'],
      ['Pagume', 'ጳጉሜ'],
    ]);

    grigDate =
      ethDate[0] +
      ' ' +
      new Date(grigDate).toDateString().substr(4).replace(/ /g, '-');
    ethDate =
      day.get(ethDate[0]) +
      ' ' +
      month.get(ethDate[1]) +
      '-' +
      ethDate[2] +
      '-' +
      ethDate[3];

    return grigDate + ' / ' + ethDate;
  }

  private returnDateCalc(DMY: string) {
    const dateArr = DMY.split(' ');
    const exceptions = [
      'Jan 31',
      'Feb 28',
      'Mar 31',
      'Feb 29',
      'Mar 31',
      'Apr 30',
      'May 31',
      'Jun 30',
      'Jul 31',
      'Aug 31',
      'Sep 30',
      'Oct 31',
      'Nov 30',
      'Dec 31',
      'Jan 31',
    ];
    const index = exceptions.indexOf(dateArr[0] + ' ' + dateArr[1]);
    if (index != -1) {
      if (index == 2) {
        return exceptions[index + 3].substr(0, 3) + ' 01 ' + dateArr[2];
      } else if (index == 13) {
        const nextYear = parseInt(dateArr[2]) + 1;
        return exceptions[index + 1].substr(0, 3) + ' 01 ' + nextYear;
      } else {
        return exceptions[index + 1].substr(0, 3) + ' 01 ' + dateArr[2];
      }
    } else {
      const x = +dateArr[1] + 1;
      dateArr[1] = x.toString();
      return dateArr.join(' ');
    }
    // return DMY;
  }

  private returnDateValidator() {
    let isValidated = true;
    // if (!this.returnForm.value.date) {
    //   return;
    // }
    // console.log('from componenet');
    // console.log(this.Form.value.busNo);
    // console.log(new Date(this.returnForm.value.date).toLocaleDateString());
    // console.log(this.returnForm.value.startingCity);
    // console.log(this.returnForm.value.destinationCity);
    const Validation = this.tripService.onTripValidationforReturnTrip(
      this.Form.value.busNo,
      new Date(this.returnForm.value.date).toLocaleDateString(),
      this.Form.value.destinationCity,
      this.Form.value.startingCity
    );
    if (!Validation.isValidated) {
      this.notification.info(
        'Returning Trip Appointment Error',
        Validation.message,
        {
          nzDuration: 0,
        }
      );

      isValidated = false;
      this.returnForm.patchValue({ date: null });
      // this.message.create(
      //   'error',
      //   `Selected return trip date is invalid\n Another trip appointed on selected date!!`
      // );
    }
    return isValidated;
  }

  clickSwitch() {
    for (const i in this.Form.controls) {
      this.Form.controls[i].markAsDirty();
      this.Form.controls[i].updateValueAndValidity();
    }

    if (this.Form.valid && this.returningTrip) {
      const Validation = this.tripService.onTripValidationforReturnTrip(
        this.Form.value.busNo,
        new Date(this.Form.value.date).toLocaleDateString(),
        this.Form.value.startingCity,
        this.Form.value.destinationCity
      );
      if (!Validation.isValidated) {
        this.notification.info('Appointment Error', Validation.message, {
          nzDuration: 0,
        });
        this.Form.patchValue({ date: null });
        this.returningTrip = false;
        // this.message.create(
        //   'error',
        //   `Selected Bus has been registered for another Trip before / after one day!!`
        // );
        return;
      }
      let date = this.Form.value.date.toString();
      const param = date.substr(4, 11);
      const nextDate = this.returnDateCalc(param);
      date = date.replace(param, nextDate);

      this.returnForm.patchValue({
        date: new Date(date),
        time: this.Form.value.time,
        startingCity: this.Form.value.destinationCity,
        destinationCity: this.Form.value.startingCity,
        busNo: this.Form.value.busNo,
      });

      this.RSPchanged();
    } else {
      this.returningTrip = false;
      this.message.create(
        'error',
        `Please fill all fields of the first trip form!!`
      );
    }
  }

  dateChanged() {
    const date = this.Form.value.date;
    if (date != '' && date != null) {
      const localDateString = new Date(date).toLocaleDateString();
      console.log(localDateString);
      this.tripService.setBuses(localDateString);
    }
  }

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private tripService: TripService,
    private memory: MemoryService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.tripService.BusSelectionMessage.subscribe((response) => {
      // this.notification.info('Unassigned Bus', response.message, { nzDuration: 0 });
      // this.notification.info('Unassigned Bus', response.message);

      this.notificationMessages.push(response);
    });
    this.tripService.busList.subscribe((response) => {
      this.busesList = response;
      // response.forEach((cur) => {
      //   if (!cur.onTrip) {
      //     this.busesList.push({
      //       label: cur.busNo,
      //       value: cur.busNo,
      //       disabled: cur.onTrip != '',
      //     });
      //   }
      //   console.log(this.busesList);
      // });
    });
    this.tripService.destinationList.subscribe((response) => {
      this.citiesList = response;
    });
    // this.tripService.SPList.subscribe((response) => console.log(response));

    this.SPForm = this.fb.group({
      city: ['', [Validators.required]],
      start: [null, [Validators.required]],
      amharicStart: [null, [Validators.required]],
    });

    this.Form = this.fb.group({
      date: [null, [Validators.required]],
      time: [
        'Sun Feb 28 2021 10:00:48 GMT+0300 (Moscow Standard Time)',
        [Validators.required],
      ],
      startingCity: ['', [Validators.required]],
      destinationCity: ['', [Validators.required]],
      // startingPlace: [null, [Validators.required]],
      busNo: ['', [Validators.required]],
    });

    this.returnForm = this.fb.group({
      // name:
      date: [null, [Validators.required]],
      time: [null, [Validators.required]],
      startingCity: [{ value: '', disabled: true }, [Validators.required]],
      destinationCity: [{ value: '', disabled: true }, [Validators.required]],
      // startingPlace: [null, [Validators.required]],
      busNo: [{ value: '', disabled: true }, [Validators.required]],
    });

    this.tripService.SPList.subscribe((response) => {
      this.SPList = [];
      const destination = this.Form.value.destinationCity;

      response.places.forEach((cur) => {
        let trueValue = false;
        console.log(cur);
        if (cur.selectedBy?.length != 0) {
          cur.selectedBy?.forEach((scur, sindex) => {
            if (scur.cid == this.companyId && scur.destination == destination) {
              trueValue = true;
              this.SPList.push({
                label: cur.name,
                value: cur.name,
                checked: true,
                disabled: false,
              });
            }
            if (!trueValue && cur.selectedBy?.length == sindex + 1) {
              this.SPList.push({
                label: cur.name,
                value: cur.name,
                checked: false,
                disabled: false,
              });
            }
          });
        } else {
          this.SPList.push({
            label: cur.name,
            value: cur.name,
            checked: false,
            disabled: false,
          });
        }
      });
    });

    this.tripService.RSPList.subscribe((response) => {
      this.returnSPList = [];
      const destination = this.returnForm.getRawValue().destinationCity;
      if (response.places) {
        response.places.forEach((cur) => {
          if (cur.selectedBy?.length != 0) {
            cur.selectedBy?.forEach((scur) => {
              if (
                scur.cid == this.companyId &&
                scur.destination == destination
              ) {
                this.returnSPList.push({
                  label: cur.name,
                  value: cur.name,
                  checked: true,
                  disabled: false,
                });
              } else {
                this.returnSPList.push({
                  label: cur.name,
                  value: cur.name,
                  checked: false,
                  disabled: false,
                });
              }
            });
          } else {
            this.returnSPList.push({
              label: cur.name,
              value: cur.name,
              checked: false,
              disabled: false,
            });
          }
        });
      }
    });

    this.tripService.driversList.subscribe((response) => {
      this.driversList = response;
      this.isModalVisible = true;
    });

    this.tripService.setDestination();
    this.notificationMessages = [];
  }
}
