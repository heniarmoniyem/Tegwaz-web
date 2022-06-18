import { MemoryService } from './memory.service';
import { EmployeeModel } from './../models/Employe.model';
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
export class EmployeAccountService {
  Employees: EmployeeModel[] = [];

  employeeList = new Subject<EmployeeModel[]>();

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase,
    private memory: MemoryService
  ) {}

  getEmployee(id: number) {
    return this.Employees[id];
  }

  retriveEmployees() {
    return this.Employees;
  }

  checkEmployee() {
    return this.Employees.length;
  }

  // deleteEmployee(Employee: EmployeeModel) {
  //   const key = Employee.key!;
  //   const index = this.Employees.indexOf(Employee);
  //   return this.db.database
  //     .ref('users')
  //     .orderByChild('eid')
  //     .equalTo(key)
  //     .once('value', (snapshot) => {
  //       snapshot.forEach((childSnapshot) => {
  //         const childKey = childSnapshot.key!;
  //         this.db
  //           .list('users')
  //           .remove(childKey)
  //           .then(() => {
  //             this.db
  //               .list('company/' + companyId + '/employee')
  //               .remove(key)
  //               .then(() => {
  //                 this.Employees.splice(index, 1);
  //                 this.employeeList.next(this.Employees);
  //               });
  //           });
  //       });
  //     });
  // }

  addEmployee(EmployeeDesc: EmployeeModel) {
    const companyId = this.memory.getCompanyId();
    return this.http
      .post<authResponse>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
          environment.firebaseConfig.apiKey,
        {
          email: EmployeeDesc.email,
          password: EmployeeDesc.password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((res) => {
          this.db
            .list('company/' + companyId + '/employee')
            .push({
              fullName: EmployeeDesc.fullName,
              phoneNumber: EmployeeDesc.phoneNumber,
              role: EmployeeDesc.role,
              regDate: EmployeeDesc.regDate,
            })
            .then((response) => {
              const eid = response.key;
              // const cid = this.memory.getCompanyId();
              this.db
                .list('users')
                .push({
                  uid: res.localId,
                  cid: companyId,
                  eid,
                  role: EmployeeDesc.role,
                })
                .then();
            });
        })
      );
  }

  setEmployees() {
    // this.Employees = [];
    const companyId = this.memory.getCompanyId();
    const ref = this.db.database.ref('company/' + companyId + '/employee');
    // this.childChanged();
    // this.childAdded();

    return ref.on('value', (snapshot) => {
      this.Employees = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: EmployeeModel;
          temp = snapshot.val()[key];
          temp.key = key;
          this.Employees.push(temp);
        }
      }
      this.employeeList.next(this.Employees);
    });
  }

  // this one is used for every company sub property changes trip, name, passengers of trip . . . . . . etc
  // childChanged() {
  //   const companyId = this.memory.getCompanyId();
  //   const ref = this.db.database
  //     .ref()
  //     .child('company/' + companyId + '/employee');
  //   ref.on('child_changed', (snapshot) => {
  //     this.Employees.forEach((cur, index) => {
  //       if (cur.key === snapshot.key) {
  //         this.Employees[index] = snapshot.val();
  //         this.Employees[index].key = snapshot.key;
  //         // console.log('changed value called');
  //       }
  //     });
  //     this.employeeList.next(this.Employees);
  //   });
  // }

  // childAdded() {
  //   const companyId = this.memory.getCompanyId();
  //   const ref = this.db.database
  //     .ref()
  //     .child('company/' + companyId + '/employee');
  //   ref.on('child_added', (snapshot) => {
  //     let temp: EmployeeModel;
  //     temp = snapshot.val();
  //     temp.key = snapshot.key!;
  //     this.Employees.push(temp);

  //     this.employeeList.next(this.Employees);
  //   });
  // }

  updateEmployee(Employee: EmployeeModel, key: string) {
    const companyId = this.memory.getCompanyId();
    Employee.key = null!;
    return this.db
      .list('company/' + companyId + '/employee')
      .update(key, Employee);
  }

  deleteEmploye(emp: EmployeeModel) {
    const companyId = this.memory.getCompanyId();
    const key = emp.key!;
    const index = this.Employees.indexOf(emp);
    return this.db.database
      .ref('users')
      .orderByChild('eid')
      .equalTo(key)
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key!;
          this.db
            .list('users')
            .remove(childKey)
            .then(() => {
              this.db
                .list('company/' + companyId + '/employee')
                .remove(key)
                .then(() => {
                  this.Employees.splice(index, 1);
                  this.employeeList.next(this.Employees);
                });
            });
        });
      });
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
