import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonIcon,  IonCard,  IonCardContent, ModalController } from '@ionic/angular/standalone';
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
    IonBackButton, IonIcon,  IonCard,
    IonCardContent]
  
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
    await modal.present();
 
    const { data } = await modal.onDidDismiss();

    if (data?.eliminado) {
      // Eliminar el pago de la lista local sin recargar
      this.dailyPayments = this.dailyPayments.filter((p: { dailyPaymentId: any; }) => p.dailyPaymentId !== data.eliminado.dailyPaymentId);
    }
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

  getLocalDate(dateString: string): Date {
    const date = new Date(dateString);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }

}
