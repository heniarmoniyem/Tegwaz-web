import { PlaceModel } from './../models/place.,model';
import { MemoryService } from './memory.service';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaceCrudService {
  Places: PlaceModel[] = [];

  placeList = new Subject<PlaceModel[]>();

  constructor(private db: AngularFireDatabase, private memory: MemoryService) {}

  getPlace(id: number) {
    return this.Places[id];
  }

  retrievePlaces() {
    return this.Places;
  }

  checkPlace() {
    return this.Places.length;
  }

  deletePlace(place: PlaceModel) {
    const companyId = this.memory.getCompanyId();
    const key = place.key!;
    const index = this.Places.indexOf(place);
    return this.db
      .list('company/' + companyId + '/place')
      .remove(key)
      .then(() => {
        this.Places.splice(index, 1);
        this.placeList.next(this.Places);
      });
  }

  addPlace(placeDesc: PlaceModel) {
    const companyId = this.memory.getCompanyId();
    return this.db.list('company/' + companyId + '/place').push({
      destination: placeDesc.destination,
      price: placeDesc.price,
      discount: { percentage: placeDesc.discount, reason: 'none' },
    });
  }

  setPlaces() {
    const companyId = this.memory.getCompanyId();
    // this.Places = [];
    const ref = this.db.database.ref('company/' + companyId + '/place');
    ref.on('value', (snapshot) => {
      this.Places = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: PlaceModel;
          temp = snapshot.val()[key];
          temp.key = key;
          this.Places.push(temp);
        }
      }
      this.placeList.next(this.Places);
    });
    // this.childChanged();
    // this.childAdded();
  }

  // this one is used for every company sub property changes trip, name, passengers of trip . . . . . . etc
  // childChanged() {
  //   const companyId = this.memory.getCompanyId();
  //   const ref = this.db.database.ref().child('company/' + companyId + '/place');
  //   return ref.on('child_changed', (snapshot) => {
  //     this.Places.forEach((cur, index) => {
  //       if (cur.key === snapshot.key) {
  //         this.Places[index] = snapshot.val();
  //         this.Places[index].key = snapshot.key;
  //       }
  //     });
  //     this.placeList.next(this.Places);
  //   });
  // }

  // childAdded() {
  //   const companyId = this.memory.getCompanyId();
  //   const ref = this.db.database.ref().child('company/' + companyId + '/place');
  //   ref.on('child_added', (snapshot) => {
  //     let temp: PlaceModel;
  //     temp = snapshot.val();
  //     temp.key = snapshot.key!;
  //     this.Places.push(temp);
  //     this.placeList.next(this.Places);
  //   });
  // }

  updatePlace(bus: PlaceModel, key: string) {
    const companyId = this.memory.getCompanyId();
    bus.key = null!;
    return this.db.list('company/' + companyId + '/place').update(key, bus);
  }
}
