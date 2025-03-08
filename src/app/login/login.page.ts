import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule, CommonModule, IonInput, IonItem, IonLabel, IonButton]
})
export class LoginPage implements OnInit {

  credentials = {
    username: '12777981',
    password: 'mySecurePassword123'
  };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    
  }

  login() {
    
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/home']); // Redirigir después del login
      },
      error: (err) => {
        this.errorMessage = 'Credenciales incorrectas';
        console.error(err);
      }
    });
  }
}
