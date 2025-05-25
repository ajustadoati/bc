import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonIcon, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, RouterModule],
})
export class HomePage {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}


  logout() {
    this.authService.logout(); // aquí puedes limpiar storage o token si es necesario
    this.router.navigate(['/login']);
  }

}
