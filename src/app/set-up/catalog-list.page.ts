import { Component, Directive, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, ModalController } from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { addIcons } from 'ionicons';
import { addOutline, callOutline, closeOutline, constructOutline, folderOutline, pricetagOutline, refreshOutline } from 'ionicons/icons';
import { CatalogItem, CatalogKind, phoneHref, searchKey } from '../shared/management.models';
import { TallerService } from '../services/taller.service';
import { CategoriaService } from '../services/categoria.service';
import { TipoGastoService } from '../services/tipo-gasto.service';
import { CatalogFormPage } from './catalog-form.page';
import { CatalogDetailPage } from './catalog-detail.page';

export const CATALOG_LIST_IMPORTS = [CommonModule, FormsModule, IonContent, IonHeader, IonFooter, IonIcon];
@Directive()
export abstract class CatalogListBase implements OnInit, OnDestroy {
  @Input() kind: CatalogKind = 'categories';
  @Input() categoryId?: number;
  @Input() categoryName = '';
  items: CatalogItem[] = [];
  search = ''; loading = false; loadError = false; openingModal = false; actionError = ''; successMessage = ''; changed = false;
  readonly phone = phoneHref;
  private readonly modalCtrl = inject(ModalController);
  private readonly router = inject(Router);
  private readonly workshops = inject(TallerService);
  private readonly categories = inject(CategoriaService);
  private readonly types = inject(TipoGastoService);
  private readonly destroyed = new Subject<void>();
  constructor() { addIcons({ addOutline, callOutline, closeOutline, constructOutline, folderOutline, pricetagOutline, refreshOutline }); }
  get searchId(): string { return `catalog-search-${this.kind}-${this.categoryId || 'all'}`; }
  get title(): string { return this.kind === 'workshops' ? 'Talleres' : this.kind === 'categories' ? 'Categorías de gastos' : this.categoryName || 'Tipos de gasto'; }
  get icon(): string { return this.kind === 'workshops' ? 'construct-outline' : this.kind === 'categories' ? 'folder-outline' : 'pricetag-outline'; }
  get addLabel(): string { return this.kind === 'workshops' ? 'Registrar taller' : this.kind === 'categories' ? 'Nueva categoría' : 'Nuevo tipo de gasto'; }
  get filtered(): CatalogItem[] { const key = searchKey(this.search); return this.items.filter(item => searchKey(`${item.name} ${item.mobileNumber || ''} ${item.direction || ''}`).includes(key)).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })); }
  trackItem(_index: number, item: CatalogItem): number { return item.id; }
  ngOnInit(): void { this.loadItems(); }
  async ionViewDidEnter(): Promise<void> { const modal = await this.modalCtrl.getTop(); if (modal) modal.canDismiss = async () => !this.openingModal; }
  loadItems(): void {
    if (this.loading) return;
    if (this.kind === 'types' && !this.categoryId) { this.loadError = true; return; }
    this.loading = true; this.loadError = false;
    const request = this.kind === 'workshops' ? this.workshops.getAll() : this.kind === 'categories' ? this.categories.getAll() : this.types.getAll(this.categoryId!);
    request.pipe(takeUntil(this.destroyed)).subscribe({ next: data => { this.items = data; this.loading = false; }, error: () => { this.loading = false; this.loadError = true; } });
  }
  async add(): Promise<void> {
    if (this.openingModal || this.loading || this.loadError) return;
    this.openingModal = true; this.actionError = ''; this.successMessage = '';
    try {
      const modal = await this.modalCtrl.create({ component: CatalogFormPage, cssClass: 'catalog-editor-modal', componentProps: { kind: this.kind, categoriaId: this.categoryId, categoriaName: this.categoryName, existingItems: this.items } });
      await modal.present(); const { data } = await modal.onDidDismiss();
      if (data?.saved) { this.search = ''; this.changed = true; this.successMessage = 'Registro guardado.'; this.loadItems(); }
    } catch { this.actionError = 'No pudimos abrir el formulario. Vuelve a intentarlo.'; }
    finally { this.openingModal = false; }
  }
  async details(item: CatalogItem): Promise<void> {
    if (this.openingModal) return;
    this.openingModal = true; this.actionError = '';
    try {
      const modal = await this.modalCtrl.create(this.kind === 'categories' ? { component: CatalogListPage, cssClass: 'catalog-list-modal', componentProps: { kind: 'types', categoryId: item.id, categoryName: item.name } } : { component: CatalogDetailPage, cssClass: 'catalog-detail-modal', componentProps: { item, kind: this.kind, categoryName: this.categoryName } });
      await modal.present(); const { data } = await modal.onDidDismiss(); if (data?.changed) this.changed = true;
    } catch { this.actionError = 'No pudimos abrir el detalle. Vuelve a intentarlo.'; }
    finally { this.openingModal = false; }
  }
  async close(): Promise<void> { if (this.openingModal) return; const modal = await this.modalCtrl.getTop(); if (modal) await modal.dismiss({ changed: this.changed }, 'cancel'); else await this.router.navigate(['/set-up']); }
  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}
@Component({ selector: 'app-catalog-list', templateUrl: './catalog-list.page.html', styleUrls: ['../shared/management.scss'], standalone: true, imports: CATALOG_LIST_IMPORTS })
export class CatalogListPage extends CatalogListBase {}
