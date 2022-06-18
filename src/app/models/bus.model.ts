export class BusModel {
  constructor(
    public busNo: string,
    public drivers: string[],
    public seatNo: number,
    public onTrip: onTrip[],
    public key?: string
  ) {}
}

export class onTrip {
  constructor(public tid: string, public date: string) {}
}
