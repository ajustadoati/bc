import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, arrowBackOutline, busOutline, calendarOutline, checkmarkOutline, constructOutline, documentTextOutline, pricetagOutline, refreshOutline, walletOutline } from 'ionicons/icons';
import { catchError, firstValueFrom, forkJoin, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { GastoService } from '../../../services/gasto.service';
import { TipoGastoService } from '../../../services/tipo-gasto.service';
import { TallerService } from '../../../services/taller.service';
import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service';
import { VehiculoService } from '../../../services/vehiculo.service';
import { FleetVehicle } from '../../../vehiculos/vehicle.models';
import { CatalogItem, CatalogKind } from '../../../shared/management.models';
import { CatalogFormPage } from '../../../set-up/catalog-form.page';
import { formatOperatingDate, localDateKey } from '../../../ingresos/income.models';
import { validOperatingDate } from '../../../ingresos/income.validators';
import { expensePayload, validVehicleId } from '../../expense.models';
import { expenseAmountRequired, nonNegativeMoney, odometerReading } from '../../expense.validators';

@Component({ selector: 'app-crear', templateUrl: './crear.page.html', styleUrls: ['../../../shared/management.scss', './crear.page.scss'], standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonFooter, IonIcon] })
export class CrearPage implements OnInit, OnDestroy {
  @Input() vehicleId: number | null = null;
  vehicle: FleetVehicle | null = null;
  categories: CatalogItem[] = [];
  expenseTypes: CatalogItem[] = [];
  workshops: CatalogItem[] = [];
  loading = false; vehicleError = false; categoryError = false; workshopError = false;
  loadingTypes = false; typesError = false; submitted = false; isSaving = false; openingModal = false;
  saveError = ''; catalogMessage = ''; saveCompleted = false;
  readonly today = localDateKey();
  readonly formatDate = formatOperatingDate;
  private readonly destroyed = new Subject<void>();
  private readonly categoryRequests = new Subject<number | null>();
  readonly formGasto = this.fb.group({
    categoryId: [null as number | null, Validators.required],
    expenseTypeId: [null as number | null, Validators.required],
    workshopId: [null as number | null],
    expenseDate: [localDateKey(), [Validators.required, validOperatingDate]],
    description: ['', Validators.maxLength(255)],
    kilometer: [null as number | null, odometerReading],
    amount: [null as number | null, nonNegativeMoney],
    amountDl: [null as number | null, nonNegativeMoney],
    labour: [null as number | null, nonNegativeMoney]
  }, { validators: expenseAmountRequired });

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private gastoService: GastoService, private modalCtrl: ModalController, private tallerService: TallerService,
    private tipoGastoService: TipoGastoService, private categoriaService: CategoriaService,
    private authService: AuthService, private vehiculoService: VehiculoService) {
    addIcons({ addOutline, arrowBackOutline, busOutline, calendarOutline, checkmarkOutline, constructOutline, documentTextOutline, pricetagOutline, refreshOutline, walletOutline });
  }
  get busy(): boolean { return this.isSaving || this.openingModal; }
  get canLeave(): boolean { return !this.busy || (this.saveCompleted && !this.openingModal); }
  get canSave(): boolean { return !this.saveCompleted && !!this.vehicle && !this.loading && !this.vehicleError && !this.categoryError && !!this.categories.length && !this.loadingTypes && !this.typesError && !this.busy; }
  get previewDate(): string { const control = this.formGasto.controls.expenseDate; return control.valid && control.value ? formatOperatingDate(control.value) : 'Por definir'; }
  get selectedCategory(): CatalogItem | undefined { return this.categories.find(item => Number(item.id) === Number(this.formGasto.controls.categoryId.value)); }
  get selectedType(): CatalogItem | undefined { return this.expenseTypes.find(item => Number(item.id) === Number(this.formGasto.controls.expenseTypeId.value)); }
  get selectedWorkshop(): CatalogItem | undefined { return this.workshops.find(item => Number(item.id) === Number(this.formGasto.controls.workshopId.value)); }
  get vehicleLabel(): string { return this.vehicle ? `Bus ${this.vehicle.numberId}` : this.vehicleId ? `Bus #${this.vehicleId}` : 'Selecciona un bus'; }
  get showAmountError(): boolean { return this.formGasto.hasError('missingAmount') && (this.submitted || this.formGasto.controls.amount.touched || this.formGasto.controls.amountDl.touched); }
  previewAmount(name: 'amount' | 'amountDl' | 'labour'): number | null {
    const control = this.formGasto.controls[name];
    return control.value != null && control.valid ? Number(control.value) : null;
  }

  ngOnInit(): void {
    this.vehicleId = validVehicleId(this.vehicleId ?? this.route.snapshot.paramMap.get('vehicleId'));
    this.categoryRequests.pipe(switchMap(id => {
      this.loadingTypes = !!id; this.typesError = false; this.expenseTypes = [];
      this.formGasto.controls.expenseTypeId.reset(null);
      this.formGasto.controls.expenseTypeId.disable({ emitEvent: false });
      if (!id) return of([]);
      return this.tipoGastoService.getAll(id).pipe(catchError(() => { this.typesError = true; return of([]); }));
    }), takeUntil(this.destroyed)).subscribe(data => {
      this.expenseTypes = data; this.loadingTypes = false;
      if (this.selectedCategory && !this.typesError) this.formGasto.controls.expenseTypeId.enable({ emitEvent: false });
      if (data.length === 1) this.formGasto.controls.expenseTypeId.setValue(data[0].id);
    });
    this.formGasto.controls.categoryId.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(id => this.categoryRequests.next(id));
    this.formGasto.controls.expenseTypeId.disable({ emitEvent: false });
    if (this.vehicleId) this.loadData();
  }

  loadData(): void {
    if (!this.vehicleId || this.loading || this.busy) return;
    this.loading = true; this.vehicleError = false; this.categoryError = false; this.workshopError = false;
    const cached = this.authService.getUser();
    const profile = cached ? of(cached) : this.authService.getUserId() ? this.authService.loadUser(this.authService.getUserId()) : throwError(() => new Error('Sesión no disponible'));
    profile.pipe(switchMap(user => forkJoin({
      vehicles: this.vehiculoService.getVehiculos(String(user.id)).pipe(catchError(() => of(null))),
      categories: this.categoriaService.getAll().pipe(catchError(() => of(null))),
      workshops: this.tallerService.getAll().pipe(catchError(() => of(null)))
    })), takeUntil(this.destroyed)).subscribe({
      next: result => {
        this.loading = false;
        this.vehicleError = result.vehicles === null; this.categoryError = result.categories === null; this.workshopError = result.workshops === null;
        if (result.vehicles) this.vehicle = result.vehicles.find(item => Number(item.id) === this.vehicleId) || null;
        if (result.categories) {
          this.categories = result.categories;
          const selected = this.formGasto.controls.categoryId.value;
          if (selected != null && !this.selectedCategory) this.formGasto.controls.categoryId.setValue(null);
          else if (this.categories.length === 1 && selected == null) this.formGasto.controls.categoryId.setValue(this.categories[0].id);
        }
        if (result.workshops) { this.workshops = result.workshops; this.formGasto.controls.workshopId.enable({ emitEvent: false }); }
        else this.formGasto.controls.workshopId.disable({ emitEvent: false });
      },
      error: () => { this.loading = false; this.vehicleError = true; this.categoryError = true; this.workshopError = true; }
    });
  }
  retryTypes(): void { if (!this.busy) this.categoryRequests.next(this.formGasto.controls.categoryId.value); }
  async ionViewDidEnter(): Promise<void> { const modal = await this.modalCtrl.getTop(); if (modal) modal.canDismiss = async (_data, role) => !this.busy || role === 'saved'; }

  fieldError(name: keyof typeof this.formGasto.controls): string {
    const control = this.formGasto.controls[name];
    if ((!this.submitted && !control.touched) || !control.errors) return '';
    if (control.hasError('required')) return 'Completa este campo.';
    if (control.hasError('negativeAmount')) return 'El importe no puede ser negativo.';
    if (control.hasError('moneyPrecision')) return 'Usa un máximo de dos decimales.';
    if (control.hasError('invalidAmount')) return 'Escribe un importe válido.';
    if (control.hasError('odometerReading')) return Number(control.value) > 2147483647 ? 'El kilometraje es demasiado alto. Revisa la lectura.' : 'Usa un kilometraje entero mayor o igual a cero.';
    if (control.hasError('futureDate')) return 'La fecha no puede ser futura.';
    if (control.hasError('invalidDate')) return 'Selecciona una fecha válida.';
    return 'Usa un máximo de 255 caracteres.';
  }

  async openCatalog(kind: CatalogKind): Promise<void> {
    if (this.busy || this.loading || !this.vehicle || (kind === 'types' && (!this.selectedCategory || this.loadingTypes))) return;
    this.openingModal = true; this.catalogMessage = '';
    try {
      const existingItems = kind === 'workshops' ? this.workshops : kind === 'categories' ? this.categories : this.expenseTypes;
      const modal = await this.modalCtrl.create({ component: CatalogFormPage, cssClass: 'catalog-editor-modal', componentProps: {
        kind, existingItems, categoriaId: kind === 'types' ? this.selectedCategory?.id : undefined, categoriaName: kind === 'types' ? this.selectedCategory?.name : ''
      } });
      await modal.present(); const { data } = await modal.onDidDismiss();
      if (!data?.saved) return;
      // Reconcile against the server so the selection uses a persisted identifier.
      if (kind === 'workshops') {
        this.workshops = await firstValueFrom(this.tallerService.getAll()); this.workshopError = false;
        this.formGasto.controls.workshopId.enable({ emitEvent: false });
        if (this.workshops.some(item => Number(item.id) === Number(data.saved.id))) this.formGasto.controls.workshopId.setValue(Number(data.saved.id));
      } else if (kind === 'categories') {
        this.categories = await firstValueFrom(this.categoriaService.getAll()); this.categoryError = false;
        if (this.categories.some(item => Number(item.id) === Number(data.saved.id))) this.formGasto.controls.categoryId.setValue(Number(data.saved.id));
      } else {
        this.expenseTypes = await firstValueFrom(this.tipoGastoService.getAll(this.selectedCategory!.id)); this.typesError = false;
        this.formGasto.controls.expenseTypeId.enable({ emitEvent: false });
        if (this.expenseTypes.some(item => Number(item.id) === Number(data.saved.id))) this.formGasto.controls.expenseTypeId.setValue(Number(data.saved.id));
      }
      this.catalogMessage = 'Registro añadido. Tus datos del gasto se conservan.';
    } catch { this.catalogMessage = 'No pudimos actualizar el catálogo. Si guardaste un registro nuevo, reintenta la carga antes de volver a crearlo. Tus datos del gasto se conservan.'; }
    finally { this.openingModal = false; }
  }

  async submitForm(): Promise<void> {
    if (!this.canSave) return;
    this.submitted = true; this.saveError = ''; this.formGasto.markAllAsTouched();
    if (this.formGasto.invalid) return;
    if (!this.selectedCategory || !this.selectedType) { this.saveError = 'Selecciona una categoría y uno de sus tipos de gasto disponibles.'; return; }
    if (this.formGasto.controls.workshopId.value != null && !this.selectedWorkshop) { this.saveError = 'El taller seleccionado ya no está disponible. Elige otro o guarda sin taller.'; return; }
    this.isSaving = true;
    try {
      const value = this.formGasto.getRawValue();
      const saved = await firstValueFrom(this.gastoService.crear(expensePayload({ ...value, expenseDate: value.expenseDate!, description: value.description || '' }, this.vehicleId!)));
      this.saveCompleted = true;
      const modal = await this.modalCtrl.getTop();
      if (modal) await modal.dismiss({ saved }, 'saved');
      else {
        // Only a confirmed save may leave while this submission is completing.
        const returned = await this.router.navigate(['/vehiculos', this.vehicleId, 'gastos'], { state: { expenseSaved: true } });
        if (!returned) this.saveError = 'El gasto se guardó. Vuelve al historial para consultarlo; no necesitas volver a guardar.';
      }
    } catch {
      this.saveError = this.saveCompleted ? 'El gasto se guardó, pero no pudimos volver al historial. Usa el botón de volver para consultarlo.' : 'No pudimos confirmar el guardado. Tus datos siguen aquí. Si falló la conexión, comprueba el historial antes de volver a guardar.';
    } finally { this.isSaving = false; }
  }
  async volverABuses(): Promise<void> { if (!this.busy) await this.router.navigate(['/gastos']); }
  async cerrar(): Promise<void> { if (this.busy) return; const modal = await this.modalCtrl.getTop(); if (modal) await modal.dismiss(null, 'cancel'); else await this.router.navigate(this.vehicleId ? ['/vehiculos', this.vehicleId, 'gastos'] : ['/gastos']); }
  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}
