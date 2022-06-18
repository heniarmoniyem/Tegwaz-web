import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface Account {
  accountNumber: string;
  admin: string;
  fullName: string;
  money: string;
  phoneNumber: string;
  pin: string;
  key?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  accountOwner: Account[] = [];
  bunnaBusAccount: Account;
  responseMessage = new Subject<string>();
  successPaymentListener = new Subject<boolean>();
  constructor(private http: HttpClient) {}

  resetData() {
    this.accountOwner = [];
    this.bunnaBusAccount = null!;
  }

  pay(price: number) {
    this.accountOwner[0].money = (
      parseInt(this.accountOwner[0].money) - price
    ).toString();
    this.bunnaBusAccount.money = this.bunnaBusAccount.money + price;

    this.updateBunnaBusAccount().subscribe(() =>
      this.updateOwnerAccount().subscribe(() => {
        this.successPaymentListener.next(true);
      })
    );
  }

  updateBunnaBusAccount() {
    return this.http.put(
      'https://bank-demo-3dfb4-default-rtdb.firebaseio.com/account/-N0s8bO4Rmp7QNDI1dJW.json',
      {
        accountNumber: this.bunnaBusAccount.accountNumber,
        admin: this.bunnaBusAccount.admin,
        fullName: this.bunnaBusAccount.fullName,
        money: this.bunnaBusAccount.money,
        phoneNumber: this.bunnaBusAccount.phoneNumber,
        pin: this.bunnaBusAccount.pin,
      }
    );
  }

  updateOwnerAccount() {
    const acc = this.accountOwner[0];
    return this.http.put(
      'https://bank-demo-3dfb4-default-rtdb.firebaseio.com/account/' +
        acc.key +
        '.json',
      {
        accountNumber: acc.accountNumber,
        admin: acc.admin,
        fullName: acc.fullName,
        money: acc.money,
        phoneNumber: acc.phoneNumber,
        pin: acc.pin,
      }
    );
  }

  private fetchBBA() {
    // https://bank-demo-3dfb4-default-rtdb.firebaseio.com/account/-N0s8bO4Rmp7QNDI1dJW
    this.http
      .get<any>(
        'https://bank-demo-3dfb4-default-rtdb.firebaseio.com/account/-N0s8bO4Rmp7QNDI1dJW.json'
      )
      .subscribe((response) => {
        this.bunnaBusAccount = response;
      });
  }

  hasEnoughtMoney(price: number): boolean {
    return parseInt(this.accountOwner[0].money) - price > 0 ? true : false;
  }

  hasCorrectPin(pin: string): boolean {
    return pin == this.accountOwner[0].pin ? true : false;
  }

  searchAccount(fullName: string, phoneNumber: string, accountNo: string) {
    this.http
      .get<any>(
        'https://bank-demo-3dfb4-default-rtdb.firebaseio.com/account.json'
      )
      .pipe(
        map((data) => {
          const response: Account[] = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              const temp: Account = data[key]!;
              if (
                temp.fullName == fullName &&
                temp.phoneNumber == phoneNumber &&
                temp.accountNumber == accountNo
              ) {
                temp.key = key;
                response.push(temp);
              }
            }
          }
          if (response.length == 0) {
            this.responseMessage.next(
              'Invalid Data Inserted! please Try Again'
            );
          }
          return response;
        })
      )
      .subscribe((response) => {
        console.log('accounts', response);
        this.accountOwner = response;
        this.fetchBBA();
      });
  }
}
