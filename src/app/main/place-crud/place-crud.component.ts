import { MemoryService } from './../../services/memory.service';
import { PlaceCrudService } from './../../services/place.crud.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PlaceModel } from 'src/app/models/place.,model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-place-crud',
  templateUrl: './place-crud.component.html',
  styleUrls: ['./place-crud.component.css'],
})
export class PlaceCrudComponent implements OnInit {
  form!: FormGroup;
  inputValue?: string;
  options: string[] = [];
  editMode = false;
  isLoading = false;
  editCache: { [key: string]: { edit: boolean; data: PlaceModel } } = {};
  listOfPlaces: PlaceModel[];
  isVisible = false;

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    // console.log(id);
    this.isVisible = false;
    const index = this.listOfPlaces.findIndex((item, index) => index === id);
    this.editCache[id] = {
      data: { ...this.listOfPlaces[index] },
      edit: false,
    };
    console.log(this.editCache[id]);
  }

  showModal(): void {
    this.isVisible = true;
  }

  // handleOk(): void {
  //   console.log('Button ok clicked!');
  //   this.isVisible = false;
  // }

  // handleCancel(): void {

  // }

  saveEdit(id: number): void {
    console.log('saveEdit called');
    const index = this.listOfPlaces.findIndex((item, index) => index === id);
    Object.assign(this.listOfPlaces[index], this.editCache[id].data);
    this.editCache[id].edit = false;
    const key = this.listOfPlaces[index].key!;
    this.placeService.updatePlace(this.listOfPlaces[index], key).then(() => {
      this.message.create(
        'success',
        `Place information has been updated successfully`
      );
    });
  }

  updateEditCache(): void {
    this.listOfPlaces.forEach((item, index) => {
      this.editCache[index] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  discountAdded(data: PlaceModel) {
    if (data.discount.percentage == 0) {
      data.discount.reason = 'none';
      this.isVisible = false;
    } else if (data.discount.reason && data.discount.percentage != 0) {
      this.isVisible = false;
      const price = data.price;
      const discount = data.discount;
      const total = price - (price * discount.percentage) / 100;

      this.notification.blank(
        'Discount Discription',
        `Updated Temporary Price is - ${total}`,
        { nzDuration: 0 }
      );
    } else {
      this.message.create('error', `Please fill the 'DISCOUNT REASON'!!`);
    }
  }

  onDelete(id: number) {
    console.log('onDelete called');
    this.placeService.deletePlace(this.listOfPlaces[id]);
  }

  submitForm() {
    // console.log('button not working');
    for (const i in this.form.controls) {
      if (this.form.value.discount == null) {
        this.form.patchValue({ discount: 0 });
      }
      // console.log('error');
      // console.log(this.form.value);
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid) {
      const destination =
        this.form.value.destination +
        ' / ' +
        this.form.value.amharicDestination;
      const price = this.form.value.price;
      const discount = this.form.value.discount;
      const Place = new PlaceModel(destination, price, discount);
      console.log(Place);
      this.placeService.addPlace(Place).then(() => {
        this.message.create('success', `New Place Registered Successfully`);
        this.form.reset();
      });
    }
  }

  resetForm() {
    this.form.reset();
  }

  constructor(
    private fb: FormBuilder,
    private placeService: PlaceCrudService,
    private message: NzMessageService,
    private notification: NzNotificationService,
    private routes: Router,
    private memory: MemoryService
  ) {}

  ngOnInit(): void {
    if (this.memory.getRole() != 'Admin') {
      this.routes.navigate(['../page-not-found']);
    }
    this.form = this.fb.group({
      destination: [null, [Validators.required]],
      price: [null, [Validators.required]],
      amharicDestination: [null, [Validators.required]],
      discount: [0, [Validators.required]],
    });

    if (!this.placeService.checkPlace()) {
      this.placeService.setPlaces();
    } else {
      this.listOfPlaces = this.placeService.retrievePlaces();
      this.updateEditCache();
    }

    this.placeService.placeList.subscribe((response) => {
      this.listOfPlaces = response;
      this.updateEditCache();
    });
  }
}
