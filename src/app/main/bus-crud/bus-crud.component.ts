import { MemoryService } from './../../services/memory.service';
import { Routes, Router } from '@angular/router';
import { BusModel } from './../../models/bus.model';
import { EmployeeModel } from './../../models/Employe.model';
// import { EmployeeModel } from './../../models/Employe.model';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { EmployeAccountService } from './../../services/employe-account.service';
import { BusCrudService } from 'src/app/services/bus.crud.service';
// import {
//   ethDateTime,
//   limits,
//   converterDateTime,
//   converterString,
// } from 'ethiopian-calendar-date-converter';

@Component({
  selector: 'app-bus-crud',
  templateUrl: './bus-crud.component.html',
  styleUrls: ['./bus-crud.component.css'],
})
export class BusCrudComponent implements OnInit {
  form!: FormGroup;
  inputValue?: string;
  options: string[] = [];
  editMode = false;
  isLoading = false;
  invalidDriverName = '';
  // previewImage: string | undefined = '';
  // previewVisible = false;
  Drivers: EmployeeModel[] = []; // ! needs editing
  editCache: { [key: string]: { edit: boolean; data: BusModel } } = {};
  listOfBuses: BusModel[];
  editError = false;

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfBuses.findIndex((item, index) => index === id);
    this.editCache[id] = {
      data: { ...this.listOfBuses[index] },
      edit: false,
    };
  }

  private editformValidation(data: BusModel) {
    if (
      data.busNo == '' ||
      data.drivers[0] == '' ||
      data.drivers[1] == '' ||
      data.seatNo == null ||
      data.seatNo == 0
    ) {
      return false;
    } else {
      return true;
    }
  }

  saveEdit(id: number): void {
    const data = this.editCache[id].data;
    if (this.editformValidation(data)) {
      this.editError = false;
      const index = this.listOfBuses.findIndex((item, index) => index === id);
      Object.assign(this.listOfBuses[index], this.editCache[id].data);
      this.editCache[id].edit = false;
      const key = this.listOfBuses[index].key!;
      this.busService.updatebus(this.listOfBuses[index], key).then(() => {
        this.message.create(
          'success',
          `bus information has been updated successfully`
        );
      });
    } else {
      this.editError = true;
      this.message.create(
        'error',
        `Please insert valid Data in the editing FORM!!!`
      );
    }
  }

  updateEditCache(): void {
    this.listOfBuses.forEach((item, index) => {
      this.editCache[index] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  private driversValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value != '') {
      const name = this.Drivers.filter((cur) => cur.fullName == control.value);
      if (name.length == 0) {
        this.invalidDriverName = control.value;
        return { required: true, error: true };
      }

      this.invalidDriverName = '';
      return {};
    }
    this.invalidDriverName = '';
    return {};
  }

  onDelete(id: number) {
    console.log('onDelete called');
    this.busService.deleteBus(this.listOfBuses[id]);
  }

  private validateFormDrivers() {
    // ! validate drivers to register on only one bus
    const driver1 = this.form.value.driver1;
    const driver2 = this.form.value.driver2;

    const result = this.listOfBuses.filter((cur) => {
      if (cur.drivers.includes(driver1)) {
        this.form.patchValue({ driver1: '' });
        return cur;
      } else if (cur.drivers.includes(driver2)) {
        this.form.patchValue({ driver2: '' });
        return cur;
      } else {
        return;
      }
    });
    if (result.length > 0) {
      this.message.create(
        'error',
        `Please Select Drivers which are not registered for another bus!!`
      );
    }
    return result;
  }

  submitForm(): void {
    if (this.invalidDriverName != null && this.invalidDriverName != '') {
      // console.log(this.invalidDriverName);
      this.message.create(
        'error',
        `Driver '${this.invalidDriverName}' is not registered in the system!!!`
      );
    }
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid && this.validateFormDrivers().length == 0) {
      const busNo = this.form.value.busNo;
      const d1 = this.form.value.driver1;
      const d2 = this.form.value.driver2;
      const drivers = [d1, d2];
      const seatNo = this.form.value.seatNo;
      const bus = new BusModel(busNo, drivers, seatNo, []);
      this.busService.addBus(bus).then(() => {
        this.form.reset();
        this.message.create('success', `New Bus Registered Successfully`);
      });
    }
  }

  resetForm() {
    this.form.reset();
  }

  constructor(
    private fb: FormBuilder,
    private busService: BusCrudService,
    private message: NzMessageService,
    private routes: Router,
    private memory: MemoryService // private etdate: ethiopic-Date,
  ) {}

  ngOnInit(): void {
    if (this.memory.getRole() != 'Admin') {
      this.routes.navigate(['../page-not-found']);
    }
    this.form = this.fb.group({
      busNo: [null, [Validators.required]],
      driver1: [null, [Validators.required, this.driversValidator.bind(this)]],
      driver2: [null, [this.driversValidator.bind(this)]],
      seatNo: [null, [Validators.required]],
    });

    this.listOfBuses = this.busService.retrieveBuses();
    this.updateEditCache();
    this.busService.busList.subscribe((response) => {
      this.listOfBuses = response;
      this.updateEditCache();
    });

    this.Drivers = this.busService.retrieveDrivers();
    this.busService.driversList.subscribe((response) => {
      this.Drivers = response;
    });

    // this.busService.setDrivers();
    // if (!this.busService.checkBus()) {
    //   this.busService.setBuses();
    // } else {

    // }
  }
}
