import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, expand, reduce } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperadorService {

  private apiUrl = environment.baseUrl+ '/api/users';

  constructor(private http: HttpClient) { }

  getOperadores(userId: string): Observable<any[]> {
    // The backend's HAL next link targets the global users endpoint. Keep
    // every page on this company's endpoint and use its page metadata instead.
    const loadPage = (page: number) => this.http.get<any>(`${this.apiUrl}/${userId}/company`, {
      params: { page: String(page), size: '100', sort: 'userId,asc' }
    });
    return loadPage(0).pipe(
      expand(data => {
        const page = data.page;
        return page && page.number + 1 < page.totalPages ? loadPage(page.number + 1) : EMPTY;
      }),
      reduce((all: any[], data: any) => {
        const items = Object.values(data._embedded || {}).find(Array.isArray) as any[] | undefined;
        return [...all, ...(items || [])];
      }, [])
    );
  }


  agregarOperador(operador: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, operador);
  }

  eliminarOperador(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
