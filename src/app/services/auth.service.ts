import { Injectable } from '@angular/core';
import {
  HttpHeaders,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { userAuth } from 'src/environments/environment.prod';
import { catchError } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginSuccess = new Subject<string>();
  $loginSuccess = this.loginSuccess.asObservable();

  constructor(private http: HttpClient) {}

  register(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const url = `${userAuth.url}/register`;
    return this.http
      .post(`${url}`, data, httpOptions)
      .pipe(catchError(this.handleError));
  }
  login(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const url = `${userAuth.url}/login`;
    return this.http
      .post(`${url}`, data, httpOptions)
      .pipe(catchError(this.handleError));
  }

  logSuccess(data) {
    this.loginSuccess.next(data);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }
}
