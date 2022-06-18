export class AdminModel {
  constructor(
    public companyName: string,
    public username: string,
    public password: string,
    public email: string,
    public website: string,
    public headOffice: string,
    public phoneNumber: string,
    public regDate: string,
    public logoUrl: string,
    public place: any[] = [],
    public bus: any[] = [],
    public key?: string
  ) {}
}
// todo must be updated while in time
