import { PassengerModel } from './passenger.model';
export class TripModel {
  constructor(
    public date: string,
    public time: string,
    public startingCity: string,
    public destinationCity: string,
    public startingPlace: string[],
    public driver: string,
    public busNo: string,
    public companyId: string,
    public passengers: PassengerModel[],
    public status: boolean[],
    public key?: string
  ) {}
}
