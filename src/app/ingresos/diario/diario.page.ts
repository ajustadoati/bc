import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonFooter, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, busOutline, cashOutline, checkmarkOutline, closeOutline, peopleOutline, refreshOutline, trashOutline, alertCircleOutline } from 'ionicons/icons';
import { catchError, firstValueFrom, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { PaymentTypeService } from '../../services/payment-type.service';
import { UserService } from '../../services/user.service';
import { DailyPaymentService } from '../../services/daily-payment.service';
import { OperadorService } from '../../services/operador.service';
import { User } from '../../interfaces/user';
import { DailyIncome, IncomeOperator, IncomePaymentType, IncomeVehicle, localDateKey, operatingDate, sumIncomeAmounts, traveledKilometers } from '../income.models';
import { jornadaValidator, moneyPrecision, validOperatingDate } from '../income.validators';

@Component({
  selector: 'app-diario',
  templateUrl: './diario.page.html',
  styleUrls: ['./diario.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonFooter, IonIcon]
})
export class DiarioPage implements OnInit, OnDestroy {
  @Input() userId?: number;
  private readonly destroyed$ = new Subject<void>();
  user: User | null = null;
  vehicles: IncomeVehicle[] = [];
  paymentTypes: IncomePaymentType[] = [];
  conductors: IncomeOperator[] = [];
  collectors: IncomeOperator[] = [];
  existingPayments: DailyIncome[] = [];
  loading = true;
  loadError = false;
  isSaving = false;
  submitted = false;
  saveError = '';
  hasSecondDriver = false;
  hasCollector = false;
  isOtherColectorSelected = false;
  readonly today = localDateKey();
  readonly dailyPaymentForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService,
    private vehiculoService: VehiculoService, private paymentTypeService: PaymentTypeService,
    private modalCtrl: ModalController, private userService: UserService,
    private dailyPaymentService: DailyPaymentService, private operadorService: OperadorService) {
    addIcons({ addOutline, busOutline, cashOutline, checkmarkOutline, closeOutline,
      peopleOutline, refreshOutline, trashOutline, alertCircleOutline });
    this.dailyPaymentForm = this.fb.group({
      vehicleId: [null, Validators.required],
      dailyDate: [this.today, [Validators.required, validOperatingDate]],
      userDriverId: [null, Validators.required],
      userSecondDriverId: [null],
      userColectorId: [null],
      otherColectorName: [''],
      otherColectorLastName: [''],
      otherColectorNumberId: [''],
      description: ['', Validators.maxLength(500)],
      kilometerStart: [null, [Validators.min(0), Validators.pattern(/^\d+$/)]],
      kilometerEnd: [null, [Validators.min(0), Validators.pattern(/^\d+$/)]],
      dailyPaymentTypes: this.fb.array([this.createPaymentRow()])
    }, { validators: jornadaValidator });
  }

  ngOnInit() { this.loadData(); }

  async ionViewDidEnter() {
    const modal = await this.modalCtrl.getTop();
    if (modal) modal.canDismiss = async (_data, role) => !this.isSaving || role === 'saved';
  }

  loadData() {
    this.loading = true;
    this.loadError = false;
    const storedUser = this.authService.getUser();
    const profile$ = storedUser ? of(storedUser) : this.authService.loadUser(this.authService.getUserId());
    profile$.pipe(
      switchMap(user => {
        this.user = user;
        this.userId = user.id;
        return forkJoin({
          vehicles: this.vehiculoService.getVehiculos(String(user.id)),
          paymentTypes: this.paymentTypeService.getPaymentTypes(),
          operators: this.userService.getUsers(user.id),
          payments: this.dailyPaymentService.obtenerPagosDiarios(String(user.id)).pipe(catchError(() => of([])))
        });
      }),
      takeUntil(this.destroyed$)
    ).subscribe({
      next: data => {
        this.vehicles = data.vehicles;
        this.paymentTypes = data.paymentTypes;
        this.conductors = data.operators.filter(operator => operator.type === 'CONDUCTOR');
        this.collectors = data.operators.filter(operator => operator.type === 'COLECTOR');
        this.existingPayments = data.payments;
        if (this.vehicles.length === 1 && !this.dailyPaymentForm.get('vehicleId')?.value) this.dailyPaymentForm.patchValue({ vehicleId: this.vehicles[0].id });
        if (this.paymentTypes.length === 1) {
          this.dailyPaymentTypes.controls.forEach(row => {
            if (!row.get('paymentTypeId')?.value) row.patchValue({ paymentTypeId: this.paymentTypes[0].paymentTypeId });
          });
        }
        this.loading = false;
      },
      error: () => { this.loading = false; this.loadError = true; }
    });
  }

  private createPaymentRow(): FormGroup {
    return this.fb.group({
      paymentTypeId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01), moneyPrecision]]
    });
  }

  get dailyPaymentTypes(): FormArray { return this.dailyPaymentForm.get('dailyPaymentTypes') as FormArray; }
  get total(): number { return sumIncomeAmounts(this.dailyPaymentTypes.value); }
  get kilometers(): number | null {
    const { kilometerStart, kilometerEnd } = this.dailyPaymentForm.value;
    return traveledKilometers(kilometerStart, kilometerEnd);
  }
  get missingCatalogs(): boolean { return !this.vehicles.length || !this.conductors.length || !this.paymentTypes.length; }
  get duplicateDay(): boolean {
    const { vehicleId, dailyDate } = this.dailyPaymentForm.value;
    return this.existingPayments.some(payment => payment.vehicleId === vehicleId && operatingDate(payment.dailyDate) === dailyDate);
  }

  fieldError(name: string): string {
    const control = this.dailyPaymentForm.get(name);
    if (name.startsWith('otherColector') && control?.hasError('pattern') && (control.touched || this.submitted)) return 'Escribe un valor que no contenga solo espacios.';
    return this.controlError(control);
  }
  controlError(control: AbstractControl | null): string {
    if (!control || (!control.touched && !this.submitted) || !control.errors) return '';
    if (control.hasError('required')) return 'Completa este campo.';
    if (control.hasError('futureDate')) return 'La jornada no puede tener una fecha futura.';
    if (control.hasError('invalidDate')) return 'Selecciona una fecha válida.';
    if (control.hasError('moneyPrecision')) return 'Usa un importe válido con un máximo de dos decimales.';
    if (control.hasError('maxlength')) return 'Usa un máximo de 500 caracteres.';
    if (control.hasError('pattern')) return 'Usa un número entero de kilómetros.';
    if (control.hasError('min')) return 'El importe debe ser mayor que cero; los kilómetros no pueden ser negativos.';
    return 'Revisa este campo.';
  }

  addPaymentType() {
    if (this.isSaving) return;
    const row = this.createPaymentRow();
    if (this.paymentTypes.length === 1) row.patchValue({ paymentTypeId: this.paymentTypes[0].paymentTypeId });
    this.dailyPaymentTypes.push(row);
  }

  removePaymentType(index: number) {
    if (!this.isSaving && this.dailyPaymentTypes.length > 1) this.dailyPaymentTypes.removeAt(index);
  }

  onSecondDriverToggle(enabled: boolean) {
    this.hasSecondDriver = enabled;
    const control = this.dailyPaymentForm.get('userSecondDriverId')!;
    control.setValidators(enabled ? [Validators.required] : []);
    if (!enabled) control.reset(null);
    control.updateValueAndValidity();
  }

  onCollectorToggle(enabled: boolean) {
    this.hasCollector = enabled;
    const control = this.dailyPaymentForm.get('userColectorId')!;
    control.setValidators(enabled ? [Validators.required] : []);
    if (!enabled) {
      control.reset(null);
      this.onColectorChange(null);
    }
    control.updateValueAndValidity();
  }

  onColectorChange(value: number | string | null) {
    this.isOtherColectorSelected = this.hasCollector && value === 'other';
    ['otherColectorName', 'otherColectorLastName', 'otherColectorNumberId'].forEach(name => {
      const control = this.dailyPaymentForm.get(name)!;
      control.setValidators(this.isOtherColectorSelected ? [Validators.required, Validators.pattern(/\S/)] : []);
      if (!this.isOtherColectorSelected) control.reset('');
      control.updateValueAndValidity();
    });
  }

  async submitForm() {
    if (this.isSaving || this.loading || this.loadError || this.missingCatalogs || !this.user) return;
    this.submitted = true;
    this.saveError = '';
    this.dailyPaymentForm.markAllAsTouched();
    if (this.dailyPaymentForm.invalid) return;
    this.isSaving = true;
    try {
      let value = this.dailyPaymentForm.value;
      if (this.isOtherColectorSelected) {
        const collector = await firstValueFrom(this.operadorService.agregarOperador({
          firstName: value.otherColectorName.trim(), lastName: value.otherColectorLastName.trim(),
          numberId: value.otherColectorNumberId.trim(), rol: 'COLECTOR', companyId: this.user.companyId
        }));
        if (!collector?.id) throw new Error('No se recibió el identificador del colector');
        this.collectors = [...this.collectors, collector];
        this.dailyPaymentForm.patchValue({ userColectorId: collector.id });
        this.onColectorChange(collector.id);
        value = this.dailyPaymentForm.value;
      }
      const payload = {
        userId: this.user.id, vehicleId: Number(value.vehicleId), dailyDate: value.dailyDate,
        userDriverId: Number(value.userDriverId),
        userSecondDriverId: this.hasSecondDriver ? Number(value.userSecondDriverId) : null,
        userColectorId: this.hasCollector ? Number(value.userColectorId) : null,
        description: value.description?.trim() || 'Ingreso diario',
        kilometerStart: value.kilometerStart == null || value.kilometerStart === '' ? null : Number(value.kilometerStart),
        kilometerEnd: value.kilometerEnd == null || value.kilometerEnd === '' ? null : Number(value.kilometerEnd),
        dailyPaymentTypes: value.dailyPaymentTypes.map((row: { paymentTypeId: number; amount: number }) => ({ paymentTypeId: Number(row.paymentTypeId), amount: Number(row.amount) }))
      };
      const saved = await firstValueFrom(this.dailyPaymentService.agregarPago(payload));
      await this.modalCtrl.dismiss({ saved }, 'saved');
    } catch {
      this.saveError = 'No pudimos confirmar el guardado. Tus datos siguen aquí. Comprueba el historial antes de reintentar si hubo un problema de conexión.';
    } finally { this.isSaving = false; }
  }

  cerrar() { if (!this.isSaving) this.modalCtrl.dismiss(null, 'cancel'); }
  ngOnDestroy() { this.destroyed$.next(); this.destroyed$.complete(); }
}
