export class User {
  constructor(
    public email: string,
    public id: String,
    public cid: string,
    public eid: string,
    public role: string,
    public key: string,
    private _token: string,
    private _tokentExpirationDate: any
  ) {}

  get Token() {
    if (
      !this._tokentExpirationDate ||
      new Date() > this._tokentExpirationDate
    ) {
      return null;
    }
    return this._token;
  }
}
