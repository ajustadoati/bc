import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentTypeService {

  private apiUrl = environment.baseUrl+ '/api/payment-types';

  constructor(private http: HttpClient) { }

  getPaymentTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }
}
