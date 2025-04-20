import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoGastoService {

  private apiUrl = environment.baseUrl+ '/api/expense-types';

  constructor(private http: HttpClient) { }

  getAll(categoryId: number): Observable<any[]> {
    console.log("Get expenses types");
    return this.http.get<any[]>(this.apiUrl+'/category/'+ categoryId)
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }
}
