import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonRow, IonTitle, IonToolbar, ModalController, IonItem, IonCardHeader, IonCardContent, IonCardTitle, IonList, IonLabel, IonNote } from '@ionic/angular/standalone';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { OperadorService } from 'src/app/services/operador.service';
import { first } from 'rxjs';
import { PaymentTypeService } from 'src/app/services/payment-type.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule, IonGrid, IonRow, IonCol, IonButton, IonButtons, IonCard, IonCardHeader, IonCardContent, IonCardTitle,
  IonList, IonLabel, IonNote] 
})
export class DetallePage implements OnInit {

  @Input() payment: any;
  user: any;

  vehiculo: any={placa: "Default", marca: "Default", modelo: "Default", numberId:0};
  chofer: any={firstName: "Default", lastName: "Default"};
  colector: any={firstName: "Default", lastName: "Default"};
  paymentTypes: any[] = [];
  constructor(private modalController: ModalController, private vehiculoService: VehiculoService, 
    private operadorService: OperadorService, private paymentTypeService: PaymentTypeService,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    
      if (this.user != null) {
        this.vehiculoService.getVehiculos(this.user.id).subscribe((vehiculos) => {
          this.vehiculo = vehiculos.find((vehiculo) => vehiculo.id == this.payment.vehicleId);
        });
        this.operadorService.getOperadores(this.user.id).subscribe((operadores) => {
          console.log(this.payment);
          this.chofer = operadores.find((operador) => operador.id == this.payment.userDriverId);
          this.colector = operadores.find((operador) => operador.id == this.payment.userColectorId);
        });
        this.paymentTypeService.getPaymentTypes().subscribe((paymentTypes) => {
          //this.paymentTypes = paymentTypes;
          console.log(paymentTypes);
          this.payment.dailyPaymentTypes.forEach((paymentType: { paymentTypeId: any; amount: any; }) => {
            const paymentTypeName = paymentTypes.find((type) => type.paymentTypeId === paymentType.paymentTypeId)?.paymentTypeName;
            console.log(`${paymentTypeName}: ${paymentType.amount}`);
            this.paymentTypes.push({paymentName: paymentTypeName, amount: paymentType.amount});
          });
        });
        
        
      }
    
    }
 
    cerrarModal() {
      this.modalController.dismiss();
    }

}
