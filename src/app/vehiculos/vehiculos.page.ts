import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { CrearPage } from './crear/crear/crear.page';
import { VehiculoService } from '../services/vehiculo.service';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';
import { VehiculosDetailsPage } from './vehiculos-details/vehiculos-details.page';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, 
    IonItem, IonLabel, IonIcon, IonButton, IonList, IonButtons,  IonBackButton ]
})
export class VehiculosPage implements OnInit {


  vehiculos = [
    { id: 1, numberId: '001', marca: 'Toyota', model: 'Corolla', serial: 'ABC123', company: 'Empresa X' },
    { id: 2, numberId: '002', marca: 'Honda', model: 'Civic', serial: 'DEF456', company: 'Empresa Y' }
  ];

  user: any;
  userId: any;
  constructor(private modalCtrl: ModalController, private vehiculosService: VehiculoService, private authService: AuthService,
    private alertController: AlertController
  ) {}
  ngOnInit(): void {
   
    if (this.userId == null) {
      this.user = this.authService.getUser();
      this.userId = this.user.id;
    }


    this.vehiculosService.getVehiculos(this.userId).subscribe({
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

  async eliminarVehiculo(vehiculo: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Vehículo',
      message: `¿Estás seguro de que deseas eliminar vehículo?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.vehiculosService.eliminarVehiculo(vehiculo.id).subscribe(() => {
              this.vehiculos= this.vehiculos.filter(o => o.id !== vehiculo.id);
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async openVeiculosDetails(vehiculo: any){
    const modalVeiculosDetails = await this.modalCtrl.create({
      component: VehiculosDetailsPage,
      componentProps: {vehiculo }
    });

    return await modalVeiculosDetails.present(); 
  }

}
