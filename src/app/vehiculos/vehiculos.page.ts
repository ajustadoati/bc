import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { CrearPage } from './crear/crear/crear.page';
import { VehiculoService } from '../services/vehiculo.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardTitle, IonCardContent, 
    IonItem, IonLabel, IonIcon, IonButton, IonList, IonButtons,  IonBackButton ]
})
export class VehiculosPage implements OnInit {

  vehiculos = [
    { numberId: '001', marca: 'Toyota', model: 'Corolla', serial: 'ABC123', company: 'Empresa X' },
    { numberId: '002', marca: 'Honda', model: 'Civic', serial: 'DEF456', company: 'Empresa Y' }
  ];

  constructor(private modalCtrl: ModalController, private vehiculosService: VehiculoService, private authService: AuthService) {}
  ngOnInit(): void {
    var userId = this.authService.getUserId();
    this.vehiculosService.getVehiculos(userId).subscribe({
      next: (response) => {
        this.vehiculos = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  async abrirModalDetalle(vehiculo: any) {
    const modal = await this.modalCtrl.create({
      component: CrearPage,
      componentProps: { vehiculo }
    });
    await modal.present();
  }

  async abrirModalAgregar() {
    const modal = await this.modalCtrl.create({
      component: CrearPage
    });
    await modal.present();
  }

}
