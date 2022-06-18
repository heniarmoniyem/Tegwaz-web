import { MemoryService } from './memory.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';

import { User } from '../models/auth.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';

export interface AuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}
@Injectable({ providedIn: 'root' })
export class Auth {
  user = new BehaviorSubject<User>(null!);
  expirationTimer: any;

  constructor(
    private http: HttpClient,
    private route: Router,
    private db: AngularFireDatabase,
    private memory: MemoryService
  ) {}

  login(account: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
          environment.firebaseConfig.apiKey,
        {
          email: account.email,
          password: account.password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((res) => {
          this.handleAuthentication(
            res.email,
            res.localId,
            res.idToken,
            +res.expiresIn
          );
        })
      );
  }

  autoLogin() {
    const userData: {
      email: string;
      id: String;
      cid: string;
      eid: string;
      role: string;
      key: string;
      _token: string;
      _tokentExpirationDate: Date;
    } = JSON.parse(localStorage.getItem('userData')!);

    if (!userData) {
      return;
    }

    const user = new User(
      userData.email,
      userData.id,
      userData.cid,
      userData.eid,
      userData.role,
      userData.key,
      userData._token,
      new Date(userData._tokentExpirationDate)
    );

    if (user.Token) {
      const expirationTime =
        new Date(userData._tokentExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationTime);
      this.user.next(user);
    }
  }

  logout() {
    this.user.next(null!);
    this.route.navigate(['/login']);
    localStorage.removeItem('userData');
    clearTimeout(this.expirationTimer);
    this.expirationTimer = null;
  }

  autoLogout(expirationTime: number) {
    this.expirationTimer = setTimeout(() => {
      this.logout();
    }, expirationTime);
  }

  private handleAuthentication(
    email: string,
    id: string,
    token: string,
    expiresIn: number
  ) {
    this.db.database
      .ref('users')
      .orderByChild('uid')
      .equalTo(id)
      .once('value', (snapshot) => {
        // snapshot.val();
        console.log(snapshot.val());
        for (const key in snapshot.val()) {
          // console.log(snapshot.val()[key].cid);
          const cid =
            snapshot.val()[key].cid != null ? snapshot.val()[key].cid : '';
          const eid =
            snapshot.val()[key].eid != null ? snapshot.val()[key].eid : '';
          const role = snapshot.val()[key].role;
          const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
          );
          const user = new User(
            email,
            id,
            cid,
            eid,
            role,
            key,
            token,
            expirationDate
          );
          // console.log(user);
          localStorage.setItem('userData', JSON.stringify(user));
          this.memory.setUserData();
          this.autoLogout(expiresIn * 1000);
          this.user.next(user);
        }
        // console.log(snapshot.val());
      });
  }

  private handleError(error: HttpErrorResponse) {
    {
      let errorMessage = 'unknown error occurred!!';
      if (error.error) {
        switch (error.error.error.message) {
          case 'EMAIL_EXISTS':
            errorMessage = 'ERROR: Email already exists';
            break;
          case 'EMAIL_NOT_FOUND':
            errorMessage = 'ERROR: email not exist!!';
            break;
          case 'INVALID_PASSWORD':
            errorMessage = 'ERROR: Incorrect password!!';
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
}
