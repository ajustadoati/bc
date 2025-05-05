import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private apiUrl = environment.baseUrl+ '/api/expense-categories';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any[]> {
    console.log("Get expenses categories");
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }

  createCategoria(data: { name: string }): Observable<any> {
    console.log("Enviando nueva categoría:", data);
    return this.http.post<any>(this.apiUrl, data);
  }
}
