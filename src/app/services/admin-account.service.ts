import { AdminModel } from './../models/Admin.model';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface authResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
  passwordHash?: string;
  providerUserInfo?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAccountService {
  Admins: AdminModel[] = [];
  adminList = new Subject<AdminModel[]>();

  constructor(private http: HttpClient, private db: AngularFireDatabase) {}

  getAdmin(id: number) {
    return this.Admins[id];
  }

  retriveAdmins() {
    return this.Admins;
  }

  checkAdmin() {
    return this.Admins.length;
  }

  deleteAdmin(admin: AdminModel) {
    const key = admin.key!;
    const index = this.Admins.indexOf(admin);
    return this.db.database
      .ref('users')
      .orderByChild('cid')
      .equalTo(key)
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key!;
          this.db
            .list('users')
            .remove(childKey)
            .then(() => {
              this.db
                .list('company')
                .remove(key)
                .then(() => {
                  this.Admins.splice(index, 1);
                  this.adminList.next(this.Admins);
                });
            });
        });
      });
  }

  addAdmin(adminDesc: AdminModel) {
    return this.http
      .post<authResponse>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
          environment.firebaseConfig.apiKey,
        {
          email: adminDesc.email,
          password: adminDesc.password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((res) => {
          this.db
            .list('company')
            .push({
              companyName: adminDesc.companyName,
              logoUrl: adminDesc.logoUrl,
              username: adminDesc.username,
              website: adminDesc.website,
              headOffice: adminDesc.headOffice,
              phoneNumber: adminDesc.phoneNumber,
              regDate: adminDesc.regDate,
            })
            .then((response) => {
              const cid = response.key;
              this.db
                .list('users')
                .push({ uid: res.localId, cid, eid: null, role: 'Admin' })
                .then();
            });
        })
      );
  }

  fetchPrice(splace: String, dplace: string) {
    const place = splace == 'addis ababa / አዲስ አበባ' ? dplace : splace;
    let price = 0;
    this.Admins[0].place.forEach((p) => {
      if (p.destination == place) {
        price = p.price;
      }
    });

    return price;
  }

  setAdmins() {
    const ref = this.db.database.ref('company');
    return ref.on('value', (snapshot) => {
      this.Admins = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: AdminModel;
          temp = snapshot.val()[key];
          temp.key = key;
          temp.place = temp.place ? this.setlevelTwoArray(temp.place) : [];
          temp.bus = temp.bus ? this.setlevelTwoArray(temp.bus) : [];
          this.Admins.push(temp);
        }
      }
      this.adminList.next(this.Admins);
      console.log('admins', this.Admins);
    });
    // this.childChanged();
    // this.childAdded();
  }

  private setlevelTwoArray(value: any) {
    const returnValue = [];
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        let temp;
        temp = value[key];
        temp.key = key;
        returnValue.push(temp);
      }
    }
    return returnValue;
  }

  // this one is used for every company sub property changes trip, name, passengers of trip . . . . . . etc
  childChanged() {
    const ref = this.db.database.ref('company');
    ref.on('child_changed', (snapshot) => {
      this.Admins.forEach((cur, index) => {
        if (cur.key === snapshot.key) {
          this.Admins[index] = snapshot.val();
          this.Admins[index].key = snapshot.key;
          // console.log('changed value called');
        }
      });
      this.adminList.next(this.Admins);
    });
  }

  childAdded() {
    const ref = this.db.database.ref('company');
    ref.on('child_added', (snapshot) => {
      let temp: AdminModel;
      temp = snapshot.val();
      temp.key = snapshot.key!;
      this.Admins.push(temp);
      this.adminList.next(this.Admins);
      // console.log(snapshot.val());
      // this.Admins.forEach((cur, index) => {
      //   if (cur.key === snapshot.key) {
      //     this.Admins[index] = snapshot.val();
      //     this.Admins[index].key = snapshot.key;
      //     // console.log('changed value called');
      //   }
      // });
    });
  }

  updateAdmin(admin: AdminModel, key: string) {
    return this.db.list('company').update(key, admin);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'ERROR: በድጋሚ ያስገቡ!!';
    if (error.error) {
      switch (error.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage =
            'ERROR: the EMAIL has been registered for another account!!';
          break;
        case 'EMAIL_NOT_FOUND':
          errorMessage = 'ERROR: ያስገቡት ኢሜል አልተመዘገበም ጸጋዬን ደውለው ያነጋግሩት!!';
          break;
        case 'INVALID_PASSWORD':
          errorMessage = 'ERROR: ፓስወርድ ተሳስተዋል በድጋሚ ይሞክሩ!!';
          break;
        default:
          errorMessage = error.error.error.message;
          break;
      }
      return throwError(errorMessage);
    }
    return throwError(errorMessage);
  }
}
