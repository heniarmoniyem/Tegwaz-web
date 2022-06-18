export class PassengerModel {
  constructor(
    public date: string,
    public deviceId: string,
    public fullName: string,
    public phoneNo: string,
    public seatNo: number,
    public startingPlace: string[],
    public status: string,
    public time: string,
    public bookingMethod: string,
    public key?: string
  ) {}
}
