export class PlaceModel {
  constructor(
    public destination: string,
    public price: number,
    public discount: { percentage: number; reason: string },
    public key?: string
  ) {}
}
