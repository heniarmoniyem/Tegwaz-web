export class EmployeeModel {
  constructor(
    public fullName: string,
    public password: string,
    public email: string,
    public phoneNumber: string,
    public role: string,
    public regDate: string,
    public key?: string
  ) {}
}
// todo must be updated while in time
