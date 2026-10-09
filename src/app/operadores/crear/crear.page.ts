import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, peopleOutline, personOutline, callOutline, checkmarkOutline } from 'ionicons/icons';
import { firstValueFrom, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { OperadorService } from '../../services/operador.service';
import { User } from '../../interfaces/user';
import { Operator, repeatedIdentity } from '../operator.models';
import { contactPhone, requiredText } from '../../shared/management.models';

@Component({ selector: 'app-crear', templateUrl: './crear.page.html', styleUrls: ['../../shared/management.scss'], standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonFooter, IonIcon] })
export class CrearPage implements OnInit, OnDestroy {
  loading = false; loadError = false; submitted = false; isSaving = false; saveError = '';
  user: User | null = null;
  operadores: Operator[] = [];
  private readonly destroyed = new Subject<void>();
  readonly form = this.fb.nonNullable.group({
    rol: ['', [Validators.required, Validators.pattern(/^(CONDUCTOR|COLECTOR)$/)]],
    numberId: ['', [requiredText, Validators.maxLength(255), (control: AbstractControl) => repeatedIdentity(control.value, this.operadores) ? { repeatedIdentity: true } : null]],
    firstName: ['', [requiredText, Validators.maxLength(255)]],
    lastName: ['', [requiredText, Validators.maxLength(255)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    mobileNumber: ['', [requiredText, contactPhone]]
  });
  constructor(private fb: FormBuilder, private operadorService: OperadorService, private authService: AuthService, private modalCtrl: ModalController, private router: Router) {
    addIcons({ closeOutline, peopleOutline, personOutline, callOutline, checkmarkOutline });
  }
  ngOnInit(): void { this.loadData(); }
  loadData(): void {
    if (this.loading) return;
    this.loading = true; this.loadError = false;
    const cached = this.authService.getUser();
    const profile = cached ? of(cached) : this.authService.getUserId() ? this.authService.loadUser(this.authService.getUserId()) : throwError(() => new Error('Sesión no disponible'));
    profile.pipe(switchMap(user => { this.user = user; return this.operadorService.getOperadores(String(user.id)); }), takeUntil(this.destroyed)).subscribe({
      next: data => { this.operadores = data; this.form.controls.numberId.updateValueAndValidity(); this.loading = false; },
      error: () => { this.loading = false; this.loadError = true; }
    });
  }
  async ionViewDidEnter(): Promise<void> {
    const modal = await this.modalCtrl.getTop();
    if (modal) modal.canDismiss = async (_data, role) => !this.isSaving || role === 'saved';
  }
  fieldError(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if ((!this.submitted && !control.touched) || !control.errors) return '';
    if (control.hasError('required') || control.hasError('requiredText')) return 'Completa este campo.';
    if (control.hasError('repeatedIdentity')) return 'Esta cédula ya está registrada en tu empresa.';
    if (control.hasError('email')) return 'Escribe un correo válido.';
    if (control.hasError('contactPhone')) return 'Usa un teléfono de 7 a 15 dígitos; puedes incluir el prefijo +.';
    if (control.hasError('maxlength')) return 'Usa un máximo de 255 caracteres.';
    return 'Selecciona un tipo de operador válido.';
  }
  async agregarOperador(): Promise<void> {
    if (this.loading || this.loadError || this.isSaving) return;
    this.submitted = true; this.saveError = '';
    for (const control of Object.values(this.form.controls)) control.setValue(control.value.trim(), { emitEvent: false });
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (!this.user?.companyId) { this.saveError = 'No pudimos identificar tu empresa. Vuelve a iniciar sesión para registrar el operador.'; return; }
    this.isSaving = true;
    try {
      const saved = await firstValueFrom(this.operadorService.agregarOperador({ ...this.form.getRawValue(), companyId: this.user.companyId }));
      const modal = await this.modalCtrl.getTop();
      if (modal) await modal.dismiss({ saved }, 'saved'); else await this.router.navigate(['/operadores']);
    } catch (error) {
      this.saveError = (error as { status?: number })?.status === 409 ? 'La cédula ya está registrada. Revisa los datos antes de guardar.' : 'No pudimos confirmar el registro. Tus datos siguen aquí. Si falló la conexión, revisa el directorio antes de volver a guardar.';
    } finally { this.isSaving = false; }
  }
  async cerrar(): Promise<void> {
    if (this.isSaving) return;
    const modal = await this.modalCtrl.getTop();
    if (modal) await modal.dismiss(null, 'cancel'); else await this.router.navigate(['/operadores']);
  }
  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}
