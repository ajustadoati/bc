import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.baseUrl+ '/api/users';

  constructor(private http: HttpClient) { }

  getUser(userId: string): Observable<any> {
    console.log(userId);
    return this.http.get<any>(this.apiUrl +'/numberId/'+ userId)
      .pipe(
        map((data: any) => {
          console.log(data);
          return data;
        })
      );
  }
}
