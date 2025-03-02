import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleTypeService {
  private apiUrl = environment.baseUrl+ '/api/vehicles-type';

  constructor(private http: HttpClient) { }

  getTipoVehiculos(): Observable<any[]> {
   
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }

}
