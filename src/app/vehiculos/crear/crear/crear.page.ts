import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { busOutline, checkmarkOutline, closeOutline, informationCircleOutline, refreshOutline } from 'ionicons/icons';
import { firstValueFrom, forkJoin, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { VehiculoService } from '../../../services/vehiculo.service';
import { AuthService } from '../../../services/auth.service';
import { VehicleTypeService } from '../../../services/vehicle-type.service';
import { User } from '../../../interfaces/user';
import { FleetVehicle, FleetVehicleType, normalizePlate, repeatedPlate, repeatedUnit, vehiclePayload, vehicleTypeLabel } from '../../vehicle.models';
import { meaningfulText, unitNumber } from '../../vehicle.validators';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonFooter, IonIcon]
})
export class CrearPage implements OnInit, OnDestroy {
  @Input() vehiculoEditar: FleetVehicle | null = null;
  private readonly destroyed$ = new Subject<void>();
  user: User | null = null;
  vehiculos: FleetVehicle[] = [];
  vehicleTypes: FleetVehicleType[] = [];
  loading = true;
  loadError = false;
  isSaving = false;
  submitted = false;
  saveError = '';
  readonly vehicleForm: FormGroup;

  constructor(private fb: FormBuilder, private vehiculoService: VehiculoService,
    private authService: AuthService, private modalCtrl: ModalController,
    private vehicleTypeService: VehicleTypeService, private router: Router) {
    addIcons({ busOutline, checkmarkOutline, closeOutline, informationCircleOutline, refreshOutline });
    const textValidators = [Validators.required, meaningfulText, Validators.maxLength(255)];
    this.vehicleForm = this.fb.group({
      numberId: ['', [Validators.required, unitNumber, (control: AbstractControl) => control.value && repeatedUnit(control.value, this.vehiculos, this.vehiculoEditar?.id) ? { repeatedUnit: true } : null]],
      serial: ['', [...textValidators, (control: AbstractControl) => repeatedPlate(control.value, this.vehiculos, this.vehiculoEditar?.id) ? { repeatedPlate: true } : null]],
      marca: ['', textValidators], model: ['', textValidators], company: ['', textValidators],
      vehicleType: [null, [Validators.required, (control: AbstractControl) => control.value == null || this.vehicleTypes.some(type => Number(type.id) === Number(control.value)) ? null : { unavailableType: true }]]
    });
  }

  ngOnInit() {
    if (this.vehiculoEditar) this.vehicleForm.patchValue({
      numberId: String(this.vehiculoEditar.numberId), serial: this.vehiculoEditar.serial,
      marca: this.vehiculoEditar.marca, model: this.vehiculoEditar.model,
      company: this.vehiculoEditar.company, vehicleType: this.vehiculoEditar.vehicleType
    });
    this.loadData();
  }
  async ionViewDidEnter() {
    const modal = await this.modalCtrl.getTop();
    if (modal) modal.canDismiss = async (_data, role) => !this.isSaving || role === 'saved';
  }

  loadData() {
    this.loading = true;
    this.loadError = false;
    const storedUser = this.authService.getUser();
    const profile$ = storedUser ? of(storedUser) : this.authService.getUserId()
      ? this.authService.loadUser(this.authService.getUserId()) : throwError(() => new Error('Sesión no disponible'));
    profile$.pipe(switchMap(user => {
      this.user = user;
      return forkJoin({ vehicles: this.vehiculoService.getVehiculos(String(user.id)), types: this.vehicleTypeService.getTipoVehiculos() });
    }), takeUntil(this.destroyed$)).subscribe({
      next: ({ vehicles, types }) => {
        this.vehiculos = vehicles;
        this.vehicleTypes = types;
        if (!this.vehiculoEditar) {
          if (types.length === 1 && !this.vehicleForm.get('vehicleType')?.value) this.vehicleForm.patchValue({ vehicleType: types[0].id });
          if (this.companies.length === 1 && !this.vehicleForm.get('company')?.value) this.vehicleForm.patchValue({ company: this.companies[0] });
        }
        ['numberId', 'serial', 'vehicleType'].forEach(name => this.vehicleForm.get(name)?.updateValueAndValidity());
        this.loading = false;
      },
      error: () => { this.loading = false; this.loadError = true; }
    });
  }

  get companies(): string[] { return Array.from(new Set(this.vehiculos.map(vehicle => vehicle.company?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')); }
  get brands(): string[] { return Array.from(new Set(this.vehiculos.map(vehicle => vehicle.marca?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')); }
  get previewType(): string { return vehicleTypeLabel(this.vehicleForm.get('vehicleType')?.value, this.vehicleTypes); }
  get previewPlate(): string { return normalizePlate(this.vehicleForm.get('serial')?.value) || 'Placa por definir'; }
  get unavailableCurrentType(): boolean {
    const type = this.vehicleForm.get('vehicleType')?.value;
    return !!type && !this.vehicleTypes.some(item => Number(item.id) === Number(type));
  }

  fieldError(name: string): string {
    const control = this.vehicleForm.get(name);
    if (!control || (!this.submitted && !control.touched) || !control.errors) return '';
    if (control.hasError('required') || control.hasError('whitespace')) return 'Completa este campo.';
    if (control.hasError('unitNumber')) return 'Usa un número de unidad válido: un entero mayor que cero.';
    if (control.hasError('repeatedUnit')) return 'Ya tienes un bus con este número de unidad.';
    if (control.hasError('repeatedPlate')) return 'Ya tienes un bus con esta placa.';
    if (control.hasError('unavailableType')) return 'Selecciona uno de los tipos de vehículo disponibles.';
    if (control.hasError('maxlength')) return 'Usa un máximo de 255 caracteres.';
    return 'Revisa este campo.';
  }

  normalizePlateField() {
    this.vehicleForm.get('serial')?.setValue(normalizePlate(this.vehicleForm.get('serial')?.value));
  }

  async agregarVehiculo() {
    if (this.isSaving || this.loading || this.loadError || !this.vehicleTypes.length || !this.user) return;
    this.submitted = true;
    this.saveError = '';
    this.vehicleForm.markAllAsTouched();
    if (this.vehicleForm.invalid) return;
    const ownerNumberId = this.authService.getUserId();
    if (!ownerNumberId) { this.saveError = 'Tu sesión ya no está disponible. Vuelve a iniciar sesión para guardar el bus.'; return; }
    this.isSaving = true;
    try {
      const payload = vehiclePayload(this.vehicleForm.value, ownerNumberId);
      const saved = await firstValueFrom(this.vehiculoEditar
        ? this.vehiculoService.actualizarVehiculo(this.vehiculoEditar.id, payload)
        : this.vehiculoService.agregarVehiculo(payload));
      const modal = await this.modalCtrl.getTop();
      if (modal) await this.modalCtrl.dismiss({ saved }, 'saved');
      else await this.router.navigate(['/vehiculos']);
    } catch (error) {
      const status = (error as { status?: number })?.status;
      this.saveError = status === 409
        ? 'El número de unidad ya está registrado. Revisa el número antes de guardar.'
        : 'No pudimos confirmar el guardado. Tus datos siguen aquí. Si hubo un problema de conexión, comprueba el listado antes de volver a intentar.';
    } finally { this.isSaving = false; }
  }

  async cerrar() {
    if (this.isSaving) return;
    const modal = await this.modalCtrl.getTop();
    if (modal) await this.modalCtrl.dismiss(null, 'cancel');
    else await this.router.navigate(['/vehiculos']);
  }
  ngOnDestroy() { this.destroyed$.next(); this.destroyed$.complete(); }
}
