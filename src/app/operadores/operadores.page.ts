import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { OperadorService } from '../services/operador.service';
import { CrearPage } from './crear/crear.page';

@Component({
  selector: 'app-operadores',
  templateUrl: './operadores.page.html',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, 
    IonItem, IonLabel, IonIcon, IonButton, IonList, IonButtons,  IonBackButton]
})
export class OperadoresPage implements OnInit {

  operadores = [
    { id: 1,firstName: 'Richard', lastName: 'Rojas', numberId: '001', mobileNumber: '42121212', type: 'Empresa X', email: "email" },
    { id: 2,firstName: 'Pablo', lastName: 'Perez', numberId: '002', mobileNumber: 'ABC123', type: 'Empresa X', email: "email" }
  ];

  user: any;

  constructor(private modalCtrl: ModalController, private operadorService: OperadorService, private authService: AuthService,
    private alertController: AlertController
  ) {}
  ngOnInit(): void {
     this.user = this.authService.getUser();
    this.operadorService.getOperadores(this.user.id).subscribe({
      next: (response) => {
        this.operadores = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  get operadoresFiltrados() {
    return this.operadores.filter(op => op.type !== 'ADMIN');
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

  async eliminarOperador(operador: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Operador',
      message: `¿Estás seguro de que deseas eliminar a ${operador.firstName} ${operador.lastName}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.operadorService.eliminarOperador(operador.id).subscribe(() => {
              this.operadores= this.operadores.filter(o => o.id !== operador.id);
            });
          },
        },
      ],
    });

    await alert.present();
  }

}
