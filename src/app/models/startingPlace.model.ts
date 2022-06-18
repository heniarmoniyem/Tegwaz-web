export class SPModel {
  constructor(
    public city: string,
    public places: [
      { name: string; selectedBy?: { cid: string; destination: string }[] }
    ],
    public key?: string
  ) {}
}
