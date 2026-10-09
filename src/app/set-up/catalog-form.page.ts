import { Component, Directive, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, ModalController } from '@ionic/angular/standalone';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline, constructOutline, folderOutline, pricetagOutline } from 'ionicons/icons';
import { CatalogItem, CatalogKind, contactPhone, requiredText, searchKey } from '../shared/management.models';
import { TallerService } from '../services/taller.service';
import { CategoriaService } from '../services/categoria.service';
import { TipoGastoService } from '../services/tipo-gasto.service';

export const CATALOG_FORM_IMPORTS = [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonFooter, IonIcon];
@Directive()
export abstract class CatalogFormBase implements OnInit, OnDestroy {
  @Input() kind: CatalogKind = 'categories';
  @Input() categoriaId?: number;
  @Input() categoriaName = '';
  @Input() existingItems: CatalogItem[] = [];
  readonly modalCtrl = inject(ModalController);
  private readonly router = inject(Router);
  private readonly workshops = inject(TallerService);
  private readonly categories = inject(CategoriaService);
  private readonly types = inject(TipoGastoService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyed = new Subject<void>();
  categoriesAvailable: CatalogItem[] = [];
  loading = false; loadError = false; isSaving = false; submitted = false; saveError = '';
  readonly form = this.fb.group({ name: ['', [requiredText, Validators.maxLength(255)]], mobileNumber: [''], direction: ['', Validators.maxLength(255)], expenseCategoryId: [null as number | null] });
  constructor() { addIcons({ closeOutline, checkmarkOutline, constructOutline, folderOutline, pricetagOutline }); }
  get title(): string { return this.kind === 'workshops' ? 'Registrar taller' : this.kind === 'categories' ? 'Nueva categoría' : 'Nuevo tipo de gasto'; }
  get icon(): string { return this.kind === 'workshops' ? 'construct-outline' : this.kind === 'categories' ? 'folder-outline' : 'pricetag-outline'; }
  get description(): string { return this.kind === 'workshops' ? 'Guarda sus datos para encontrarlo al registrar un gasto.' : this.kind === 'categories' ? 'Agrupa tus gastos para entender mejor en qué inviertes.' : 'Añade una opción concreta para clasificar tus gastos.'; }
  ngOnInit(): void {
    if (this.kind === 'workshops') this.form.controls.mobileNumber.setValidators([requiredText, contactPhone]);
    if (this.kind === 'types') {
      this.form.controls.expenseCategoryId.setValidators([Validators.required]);
      if (this.categoriaId) this.form.controls.expenseCategoryId.setValue(this.categoriaId);
      else this.loadCategories();
    }
    this.form.controls.mobileNumber.updateValueAndValidity();
    this.form.controls.expenseCategoryId.updateValueAndValidity();
  }
  loadCategories(): void {
    if (this.loading) return;
    this.loading = true; this.loadError = false;
    this.categories.getAll().pipe(takeUntil(this.destroyed)).subscribe({ next: data => { this.categoriesAvailable = data; this.loading = false; }, error: () => { this.loading = false; this.loadError = true; } });
  }
  async ionViewDidEnter(): Promise<void> { const modal = await this.modalCtrl.getTop(); if (modal) modal.canDismiss = async (_data, role) => !this.isSaving || role === 'saved'; }
  fieldError(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if ((!this.submitted && !control.touched) || !control.errors) return '';
    if (control.hasError('requiredText') || control.hasError('required')) return 'Completa este campo.';
    if (control.hasError('contactPhone')) return 'Usa un teléfono de 7 a 15 dígitos; puedes incluir el prefijo +.';
    return 'Usa un máximo de 255 caracteres.';
  }
  async submitForm(): Promise<void> {
    if (this.isSaving || this.loading || this.loadError) return;
    this.submitted = true; this.saveError = '';
    for (const key of ['name', 'mobileNumber', 'direction'] as const) { const control = this.form.controls[key]; control.setValue(control.value?.trim() || '', { emitEvent: false }); }
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const categoryId = this.categoriaId || Number(value.expenseCategoryId);
    if (this.kind === 'types' && (!categoryId || (!this.categoriaId && !this.categoriesAvailable.some(item => Number(item.id) === categoryId)))) { this.saveError = 'Selecciona una categoría disponible.'; return; }
    if (this.existingItems.some(item => searchKey(item.name) === searchKey(value.name))) { this.saveError = 'Ya existe un registro con este nombre en la lista. Usa otro nombre.'; return; }
    this.isSaving = true;
    try {
      const request = this.kind === 'workshops' ? this.workshops.createWorkshop({ name: value.name!, mobileNumber: value.mobileNumber!, direction: value.direction || '' }) : this.kind === 'categories' ? this.categories.createCategoria({ name: value.name! }) : this.types.addSubCategoria({ name: value.name!, expenseCategoryId: categoryId });
      const saved = await firstValueFrom(request);
      const modal = await this.modalCtrl.getTop();
      if (modal) await modal.dismiss({ saved }, 'saved'); else await this.router.navigate(['/set-up']);
    } catch {
      this.saveError = 'No pudimos confirmar el guardado. Tus datos siguen aquí. Si falló la conexión, revisa la lista antes de volver a guardar.';
    } finally { this.isSaving = false; }
  }
  async closeModal(): Promise<void> { if (this.isSaving) return; const modal = await this.modalCtrl.getTop(); if (modal) await modal.dismiss(null, 'cancel'); else await this.router.navigate(['/set-up']); }
  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}
@Component({ selector: 'app-catalog-form', templateUrl: './catalog-form.page.html', styleUrls: ['../shared/management.scss'], standalone: true, imports: CATALOG_FORM_IMPORTS })
export class CatalogFormPage extends CatalogFormBase {}
