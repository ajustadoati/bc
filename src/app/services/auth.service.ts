import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import jwt_decode, { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.baseUrl+'/api/auth'; 
  private authState = new BehaviorSubject<boolean>(false); 

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken(); // Verificar si el usuario ya tiene sesión activa
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    console.log(credentials);
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          const user = this.decodeToken(response.token);
          localStorage.setItem('userId', user.userId); // Guarda el ID del usuario
          this.authState.next(true);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserId(): string  {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.sub; // Retorna el sub (ID del usuario)
      } catch (error) {
        console.error('Error decodificando el token:', error);
      }
    }
    
    return ''; // Si no hay token o falla la decodificación
  }

  private decodeToken(token: string | null): any {
      if (!token) {
        console.error('No token provided');
        return null;
      }
    
      try {
        return jwtDecode(token);
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.authState.next(true);
      } else {
        this.logout(); // Si el token es inválido, cerrar sesión
      }
    }
  }

  getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }
}


