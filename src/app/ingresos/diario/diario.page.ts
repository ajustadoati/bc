import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonGrid, IonRow, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonSelectOption, IonTitle, IonToolbar, IonButtons, IonModal, IonDatetime, IonDatetimeButton, IonSelect, IonInput, IonCol } from '@ionic/angular/standalone';
import { PaymentTypeService } from 'src/app/services/payment-type.service';
import { UserService } from 'src/app/services/user.service';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DailyPaymentService } from 'src/app/services/daily-payment.service';
import { AlertController } from '@ionic/angular/standalone';
import { OperadorService } from 'src/app/services/operador.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-diario',
  templateUrl: './diario.page.html',
  styleUrls: ['./diario.page.scss'],
  standalone: true,
  imports: [IonCol, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, 
    IonCard, IonCardContent, IonSelectOption, IonList, IonListHeader, IonButton, ReactiveFormsModule,
    IonButton, IonButtons,IonSelect, IonInput, IonGrid, IonRow
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
  conductors: any[] = [];
  collectors:any[] = [];
  isOtherColectorSelected = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private vehiculoService: VehiculoService,
    private paymentTypeService: PaymentTypeService,
    private modalCtrl: ModalController,
    private userService: UserService,
    private dailyPaymentService: DailyPaymentService,
    private alertController: AlertController,
    private operadorService: OperadorService
  ) {
    this.dailyPaymentForm = this.fb.group({
      userId: [''],
      userColectorId: ['', Validators.required],
      otherColectorName: [''],
      userDriverId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      dailyDate: [formatDate(new Date(), 'yyyy-MM-dd', 'en-US')],
      kilometerStart: [''],
      kilometerEnd: [''],
      dailyPaymentTypes: this.fb.array([
        this.fb.group({
          paymentTypeId: ['', Validators.required],
          amount: [Validators.required, Validators.min(0.01)]
        })
      ])
    });
  }

  ngOnInit() {
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
        this.conductors = this.users.filter(user => user.type === 'CONDUCTOR');
        this.collectors = this.users.filter(user => user.type === 'COLECTOR');
      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  onColectorChange(value: string) {
    this.isOtherColectorSelected = value === 'other';
    if (this.isOtherColectorSelected) {
      this.dailyPaymentForm.get('otherColectorName')?.setValidators([Validators.required]);
    } else {
      this.dailyPaymentForm.get('otherColectorName')?.clearValidators();
      this.dailyPaymentForm.get('otherColectorName')?.setValue('');
    }
    this.dailyPaymentForm.get('otherColectorName')?.updateValueAndValidity();
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



async submitForm() {
  if (this.dailyPaymentForm.invalid) {
    await this.showAlert('Formulario incompleto', 'Por favor, completa todos los campos obligatorios.');
    return;
  }

  const formValue = this.dailyPaymentForm.value;

  try {
    // Si se selecciona "Otro", creamos primero al colector
    if (formValue.userColectorId === 'other') {
      const newColector = {
        firstName: formValue.otherColectorName,
        lastName: 'Colector',
        numberId: '1-' + formValue.otherColectorName,
        rol: 'COLECTOR',
        companyId: this.userId
      };

      const response = await firstValueFrom(this.operadorService.agregarOperador(newColector));
      console.log('Usuario agregado correctamente', response.id);

      this.dailyPaymentForm.patchValue({ userColectorId: response.id });
    }

    this.dailyPaymentForm.patchValue({ userId: this.userId });

    console.log("payload", this.dailyPaymentForm.value);

    await firstValueFrom(this.dailyPaymentService.agregarPago(this.dailyPaymentForm.value));

    await this.showAlert('Éxito', 'Pago diario guardado correctamente.');
    this.modalCtrl.dismiss();

  } catch (err) {
    console.error(err);
    await this.showAlert('Error', 'Error al guardar el pago diario.');
  }
}

  


  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
  
    await alert.present();
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'refresh');
  }

}
