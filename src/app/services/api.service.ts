import { Injectable, EventEmitter } from '@angular/core';
import {
  HttpHeaders,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { userAuth } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  postalCode;

  private placeObjSubjectFrom = new Subject<string>();
  $postCodeObsFrom = this.placeObjSubjectFrom.asObservable();

  private placeObjSubjectTo = new Subject<string>();
  $postCodeObsTo = this.placeObjSubjectTo.asObservable();

  progressSubject = new Subject<any>();
  $progressSubject = this.progressSubject.asObservable();

  constructor(private http: HttpClient) {}

  onShipClick = new EventEmitter<any>();

  shipEngineGetRates(data) {
    const endPoint = `${userAuth.url}/shipdata`;
    return this.http
      .post(`${endPoint}`, data)
      .pipe(catchError(this.handleError));
  }

  userTransactions(data) {
    const endPoint = `${userAuth.url}/alltransactions`;
    return this.http
      .post(`${endPoint}`, data)
      .pipe(catchError(this.handleError));
  }

  geocodeAddress(data, index) {
    const geocoder = new google.maps.Geocoder();
    const that = this;
    geocoder.geocode({ address: data.formatted_address }, function(
      results,
      status
    ) {
      const lat = results[0].geometry.location.lat();
      const lng = results[0].geometry.location.lng();
      that.geocodeLatLng(lat, lng, index);
    });
  }

  geocodeLatLng(lat, lng, index) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: lat, lng: lng };
    const that = this;
    geocoder.geocode({ location: latlng }, function(results, status) {
      if (results[0]) {
        const dataLocation = {
          formatedAddress: '',
          postalCode: '',
          locality: '',
          state: ''
        };
        for (let n = 0; results[0].address_components.length > n; n++) {
          if (results[0].address_components[n].types[0] === 'postal_code') {
            dataLocation.postalCode =
              results[0].address_components[n].long_name;
          }
          if (results[0].address_components[n].types[0] === 'street_number') {
            dataLocation.formatedAddress =
              results[0].address_components[n].long_name;
          }
          if (results[0].address_components[n].types[0] === 'route') {
            dataLocation.formatedAddress +=
              ' ' + results[0].address_components[n].long_name;
          }
          if (
            results[0].address_components[n].types[1] === 'locality' ||
            results[0].address_components[n].types[0] === 'locality'
          ) {
            dataLocation.locality = results[0].address_components[n].long_name;
          }
          if (
            results[0].address_components[n].types[0] ===
            'administrative_area_level_1'
          ) {
            dataLocation.state = results[0].address_components[n].short_name;
          }
        }
        if (index === 2) {
          that.placeObjSubjectFrom.next(JSON.stringify(dataLocation));
        } else {
          that.placeObjSubjectTo.next(JSON.stringify(dataLocation));
        }
      } else {
        window.alert('No results found');
      }
    });
  }

  getShipmentRate(data) {
    const endPoint = `${userAuth.url}/getshipmentrate`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .post(`${endPoint}`, data, httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error(error);
    } else {
      console.error(error);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getCarriers() {
    const endPoint = `${userAuth.url}/getcarriers`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .get(`${endPoint}`, httpOptions)
      .pipe(catchError(this.handleError));
  }

  getLabel(data) {
    const endPoint = `${userAuth.url}/ratePrintLabel/${data}`;
    const testLabel = {
      test_label: true,
      label_layout: '4x6'
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .post(`${endPoint}`, testLabel, httpOptions)
      .pipe(catchError(this.handleError));
  }

  postOrderSuccess(data) {
    const endPoint = `${userAuth.url}/ordersuccess`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .post(`${endPoint}`, data, httpOptions)
      .pipe(catchError(this.handleError));
  }

  stripePost(data) {
    const endPoint = `${userAuth.url}/stripepay`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http
      .post(`${endPoint}`, data, httpOptions)
      .pipe(catchError(this.handleError));
  }

  saveUserData(data) {
    const endPoint = `${userAuth.url}/saveaddress`;
    const token = localStorage.getItem('userToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        token: `${token}`
      })
    };
    return this.http
      .post(`${endPoint}`, data, httpOptions)
      .pipe(catchError(this.handleError));
  }

  getUserAddresses() {
    const endPoint = `${userAuth.url}/getuseraddress/${localStorage.getItem(
      'userId'
    )}`;
    const token = localStorage.getItem('userToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        token: `${token}`
      })
    };
    return this.http
      .get(`${endPoint}`, httpOptions)
      .pipe(catchError(this.handleError));
  }
}
