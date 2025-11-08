import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, ModalController, IonCardHeader, IonCardContent, IonCardTitle, IonIcon, IonChip,  IonAlert } from '@ionic/angular/standalone';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { OperadorService } from 'src/app/services/operador.service';
import { PaymentTypeService } from 'src/app/services/payment-type.service';
import { AuthService } from 'src/app/services/auth.service';
import { DailyPaymentService } from 'src/app/services/daily-payment.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons, IonCard, IonCardHeader, IonCardContent, IonCardTitle, 
    IonChip,  IonAlert]
})
export class DetallePage implements OnInit {

  @Input() payment: any;
  user: any;

  vehiculo: any = { placa: "Default", marca: "Default", modelo: "Default", numberId: 0 };
  chofer: any = { firstName: "Default", lastName: "Default" };
  colector: any = null; // Inicializado como null para manejo condicional
  segundoChofer: any = null; // Nuevo campo para segundo chofer
  paymentTypes: any[] = [];

  showAlert = false;
  alertButtons: any[] = [];


  constructor(
    private modalController: ModalController,
    private vehiculoService: VehiculoService,
    private operadorService: OperadorService,
    private paymentTypeService: PaymentTypeService,
    private authService: AuthService,
    private dailyPaymentService: DailyPaymentService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    
    this.alertButtons = [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          this.showAlert = false;
        }
      },
      {
        text: 'Eliminar',
        role: 'confirm',
        handler: () => {
          this.eliminarPago();
        }
      }
    ];


    if (this.user != null) {
      // Cargar vehículo
      this.vehiculoService.getVehiculos(this.user.id).subscribe((vehiculos) => {
        this.vehiculo = vehiculos.find((vehiculo) => vehiculo.id == this.payment.vehicleId);
      });

      // Cargar operadores (chofer, segundo chofer, colector)
      this.operadorService.getOperadores(this.user.id).subscribe((operadores) => {
        console.log('Payment data:', this.payment);
        
        // Chofer principal
        this.chofer = operadores.find((operador) => operador.id == this.payment.userDriverId);
        
        // Segundo chofer (solo si existe)
        if (this.payment.userSecondDriverId) {
          this.segundoChofer = operadores.find((operador) => operador.id == this.payment.userSecondDriverId);
        }
        
        // Colector (solo si existe)
        if (this.payment.userColectorId) {
          this.colector = operadores.find((operador) => operador.id == this.payment.userColectorId);
        }
      });

      // Cargar tipos de pago
      this.paymentTypeService.getPaymentTypes().subscribe((paymentTypes) => {
        this.paymentTypes = []; // Limpiar array
        this.payment.dailyPaymentTypes.forEach((paymentType: { paymentTypeId: any; amount: any; }) => {
          const paymentTypeName = paymentTypes.find((type) => type.paymentTypeId === paymentType.paymentTypeId)?.paymentTypeName;
          this.paymentTypes.push({ paymentName: paymentTypeName, amount: paymentType.amount });
        });
      });
    }
  }

  getTotal(): number {
    return this.paymentTypes.reduce((total, type) => total + type.amount, 0);
  }

  getPaymentChipColor(index: number): string {
    const colors = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger'];
    return colors[index % colors.length];
  }

  confirmarEliminacion() {
    this.showAlert = true;
  }

  eliminarPago() {
    if (!this.payment?.dailyPaymentId) return;

    this.dailyPaymentService.eliminarPago(this.payment.dailyPaymentId).subscribe({
      next: () => {
        console.log('Pago eliminado:', this.payment);
        this.modalController.dismiss({ eliminado: this.payment })
      },
      error: (err) => {
        console.error('Error eliminando pago:', err);
      }
    });
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}
