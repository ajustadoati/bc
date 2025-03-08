import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperadorService {

  private apiUrl = environment.baseUrl+ '/api/users';

  constructor(private http: HttpClient) { }

  getOperadores(userId: string): Observable<any[]> {
   
    return this.http.get<any[]>(this.apiUrl +'/'+ userId + '/company')
      .pipe(
        map((data: any) => {
          return data._embedded.collection;
        })
      );
  }


  agregarOperador(operador: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, operador);
  }

  eliminarOperador(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
