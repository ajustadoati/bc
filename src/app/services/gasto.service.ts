import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private apiUrl = environment.baseUrl+ '/api/expenses';

  constructor(private http: HttpClient) { }

  getByVehiculo(vehiculoId: number): Observable<any[]> {
    console.log("Get vehiculos", vehiculoId);
    return this.http.get<any[]>(this.apiUrl +'/'+ vehiculoId + '/vehicle')
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }

  crear(gasto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, gasto);
  }


}
