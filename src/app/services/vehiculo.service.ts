import { HttpClient } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiUrl = environment.baseUrl+ '/api/vehicles';

  constructor(private http: HttpClient) { }

  getVehiculos(userId: string): Observable<any[]> {
    console.log("Get vehiculos", userId);
    return this.http.get<any[]>(this.apiUrl +'/'+ userId + '/user')
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }


  agregarVehiculo(vehiculo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, vehiculo);
  }

  actualizarVehiculo(id: number, vehiculo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, vehiculo);
  }

  eliminarVehiculo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
