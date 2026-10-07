import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, switchMap, tap, throwError } from 'rxjs';
import jwt_decode, { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.baseUrl+'/api/auth'; 
  private authState = new BehaviorSubject<boolean>(false); 
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private userService: UserService) {
    this.checkToken(); // Verificar si el usuario ya tiene sesión activa
  }

  login(credentials: { username: string; password: string }): Observable<any> {
   
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      switchMap(response => {
        const user = this.decodeToken(response.token);
        if (!response.token || !user?.sub) {
          return throwError(() => new Error('Respuesta de acceso inválida'));
        }
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', user.sub);
        return this.loadUser(user.sub).pipe(
          tap(() => this.authState.next(true)),
          catchError(error => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            this.userSubject.next(null);
            this.authState.next(false);
            return throwError(() => error);
          })
        );
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.userSubject.next(null);
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

  loadUser(userId: string): Observable<User> {
    console.log("loading user",userId);
    return this.userService.getUser(userId).pipe(
      tap(user => this.userSubject.next(user)) // Guarda el usuario en el BehaviorSubject
    );
  }

  getUser(): User | null {
    console.log("getting user",this.userSubject.value);
    return this.userSubject.value;
  }

  getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }
}
