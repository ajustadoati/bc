import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TallerService {

  private apiUrl = environment.baseUrl+ '/api/workshops';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any[]> {
    console.log("Get workshops");
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }
    
  createWorkshop(data: { name: string; phone: string }): Observable<any> {
    console.log("Enviando nuevo taller:", data);
    return this.http.post<any>(this.apiUrl, data);
  }
}

