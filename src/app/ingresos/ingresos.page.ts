import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonIcon, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonCol, IonRow, ModalController, IonBadge } from '@ionic/angular/standalone';
import { DailyPaymentService } from '../services/daily-payment.service';
import { DetallePage } from './detalle/detalle/detalle.page';
import { AlertController } from '@ionic/angular';
import { DiarioPage } from './diario/diario.page';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.page.html',
  styleUrls: ['./ingresos.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons,
    IonBackButton, IonIcon,
  IonList, IonItem, IonLabel]
  
})
export class IngresosPage implements OnInit {
  operadoresFiltrados: any;
  dailyPayments: any;
  pagos: any;
  user: any;

  eliminarOperador(_t29: any) {
  throw new Error('Method not implemented.');
  }
  

  constructor(private dailyPaymentService: DailyPaymentService, private modalController: ModalController,
    private alertController: AlertController, private authService: AuthService) { }

  ngOnInit() {
    this.user = this.authService.getUser();

    this.dailyPaymentService.obtenerPagosDiarios(this.user.id).subscribe({
      next: (response) => {
        this.dailyPayments = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getTotal(dailyPaymentTypes: any[]): number {
    return dailyPaymentTypes.reduce((total, type) => total + type.amount, 0);
  }

  async abrirModalDetalle(payment: any) {
    const modal = await this.modalController.create({
      component: DetallePage,
      componentProps: {
        payment: payment
      }
    });
    return await modal.present();
  }

  async abrirModalAgregar(userId: any) {
    const modal = await this.modalController.create({
      component: DiarioPage,
      componentProps: {
        userId: userId
      },
  
    });
    return await modal.present();
  }

}
