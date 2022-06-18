import { AngularFireDatabase } from '@angular/fire/database';
import { MemoryService } from './memory.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SellTicketService {
  sellTicket(
    tripId: string,
    fullName: string,
    phoneNo: number,
    seatNo: number,
    startingPlace: string
  ) {
    const employeeId = this.memory.getEmployeeId();

    return this.db.list('trip/' + tripId + '/passengers').push({
      date: new Date().toLocaleDateString(),
      deviceId: '0',
      fullName,
      phoneNo,
      seatNo,
      startingPlace,
      status: 'sold',
      time: new Date().toLocaleTimeString(),
      bookingMethod: employeeId,
    });
  }

  cancelTrip(key: string, tripId: string) {
    return this.db.list('trip/' + tripId + '/passengers').remove(key);
  }

  constructor(private db: AngularFireDatabase, private memory: MemoryService) {}
}
