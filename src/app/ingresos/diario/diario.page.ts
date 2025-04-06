import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonSelectOption, IonTitle, IonToolbar, IonButtons, IonModal, IonDatetime, IonDatetimeButton, IonSelect, IonInput } from '@ionic/angular/standalone';
import { PaymentTypeService } from 'src/app/services/payment-type.service';
import { UserService } from 'src/app/services/user.service';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DailyPaymentService } from 'src/app/services/daily-payment.service';

@Component({
  selector: 'app-diario',
  templateUrl: './diario.page.html',
  styleUrls: ['./diario.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, 
    IonCard, IonCardContent, IonSelectOption, IonList, IonListHeader, IonButton, ReactiveFormsModule,
    IonButton, IonButtons,IonSelect, IonInput
  ] 
})
export class DiarioPage implements OnInit {

  dailyPaymentForm: FormGroup;
  users: any[] = [];
  vehicles: any[] = [];
  paymentTypes: any[] = [];
  @Input() payment: any;
  @Input() userId: any;
  user: any;
  date!: Date;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private vehiculoService: VehiculoService,
    private paymentTypeService: PaymentTypeService,
    private modalCtrl: ModalController,
    private userService: UserService,
    private dailyPaymentService: DailyPaymentService
  ) {
    this.dailyPaymentForm = this.fb.group({
      userId: [''],
      userColectorId: [''],
      userDriverId: [''],
      vehicleId: [''],
      dailyDate: [formatDate(new Date(), 'yyyy-MM-dd', 'en-US')],
      kilometerStart: [''],
      kilometerEnd: [''],
      dailyPaymentTypes: this.fb.array([
        this.fb.group({
          paymentTypeId: [''],
          amount: ['']
        })
      ])
    });
  }

  ngOnInit() {
    //this.userService.getUsers().subscribe(data => this.users = data);
    if (this.userId == null) {
      this.user = this.authService.getUser();
      this.userId = this.user.id;
    }

    this.vehiculoService.getVehiculos(this.userId).subscribe({
      next: (response) => {
        console.log(response);
        this.vehicles = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
 
    this.paymentTypeService.getPaymentTypes().subscribe({
      next: (response) => {
        console.log(response);
        this.paymentTypes = response;
      },
      error: (err) => {
        console.error(err);
      }
    });

    this.userService.getUsers(this.userId).subscribe({
  
      next: (response) => {
        console.log(response);
        this.users = response;
      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  get dailyPaymentTypes(): FormArray {
    return this.dailyPaymentForm.get('dailyPaymentTypes') as FormArray;
  }

  addPaymentType() {
    this.dailyPaymentTypes.push(this.fb.group({
      paymentTypeId: [''],
      amount: ['']
    }));
  }

  submitForm() {
    console.log('values for saving:', this.dailyPaymentForm.value);
    this.dailyPaymentForm.value.userId = this.userId;

    this.dailyPaymentService.agregarPago(this.dailyPaymentForm.value).subscribe({
      next: (response) => {
        console.log(response);
        alert('Pago diario guardado correctamente');
        this.modalCtrl.dismiss();
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar el pago diario');
      }
    });
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }


}
