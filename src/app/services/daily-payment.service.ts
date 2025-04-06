import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DailyPaymentService {

  private apiUrl = environment.baseUrl+ '/api/daily-payments';

  constructor(private http: HttpClient) { }

  obtenerPagosDiarios(userId: string): Observable<any[]> {
   
    return this.http.get<any[]>(this.apiUrl +'/'+ userId + '/user')
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }


  agregarPago(pago: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pago);
  }

  eliminarPago(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
