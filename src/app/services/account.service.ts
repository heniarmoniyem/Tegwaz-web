import { catchError } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private http: HttpClient) {}

  resetPassword(email: string) {
    return this.http
      .post<{ email: string; kind: string }>(
        'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' +
          environment.firebaseConfig.apiKey,
        {
          requestType: 'PASSWORD_RESET',
          email,
        }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    {
      let errorMessage = 'unknown error occurred!!';
      if (error.error) {
        switch (error.error.error.message) {
          case 'EMAIL_NOT_FOUND':
            errorMessage = 'ERROR: email not exist!!';
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
