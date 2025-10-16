import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonIcon, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonCol, IonRow, ModalController, IonBadge, IonCardSubtitle, IonChip } from '@ionic/angular/standalone';
import { DailyPaymentService } from '../services/daily-payment.service';
import { DetallePage } from './detalle/detalle/detalle.page';
import { AlertController } from '@ionic/angular';
import { DiarioPage } from './diario/diario.page';
import { AuthService } from '../services/auth.service';
import { VehiculoService } from '../services/vehiculo.service';

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.page.html',
  styleUrls: ['./ingresos.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons,
    IonBackButton, IonIcon, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent, IonCardSubtitle, IonGrid, IonRow, IonCol, IonChip]
  
})
export class IngresosPage implements OnInit {
  operadoresFiltrados: any;
  dailyPayments: any;
  pagos: any;
  user: any;
  vehiculos: any[]=[];

  eliminarOperador(_t29: any) {
  throw new Error('Method not implemented.');
  }
  

  constructor(private dailyPaymentService: DailyPaymentService, private modalController: ModalController,
    private alertController: AlertController, private authService: AuthService, private vehiculoService: VehiculoService) { }

  ngOnInit() {
    this.cargarPagos();
    this.cargarVehiculos();
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

  cargarPagos() {
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

  cargarVehiculos() {
    this.user = this.authService.getUser();

    this.vehiculoService.getVehiculos(this.user.id).subscribe({
      next: (response) => {
        this.vehiculos = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getVehicleNumberId(vehicleId: any): string {
    const vehiculo = this.vehiculos.find(v => v.id === vehicleId);
    return vehiculo ? vehiculo.numberId : 'Desconocido';
  }

  hasDriverInfo(payment: any): boolean {
    return payment.userDriverId || payment.userSecondDriverId;
  }

  getDriversCount(payment: any): number {
    let count = 0;
    if (payment.userDriverId) count++;
    if (payment.userSecondDriverId) count++;
    return count;
  }

  async abrirModalAgregar(userId: any) {
    const modal = await this.modalController.create({
      component: DiarioPage,
      componentProps: {
        userId: this.user?.id
      }
    });
  
    await modal.present();
  
    const { role } = await modal.onWillDismiss();
    
    // Luego de cerrar el modal, actualizamos la lista
    if (role !== 'refresh') {
      this.cargarPagos();  // método que vuelve a cargar los datos
    }
  }

}
