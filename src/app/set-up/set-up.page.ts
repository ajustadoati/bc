import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { addIcons } from 'ionicons';
import { arrowBackOutline, busOutline, chevronForwardOutline, constructOutline, folderOutline, optionsOutline, pricetagOutline, refreshOutline } from 'ionicons/icons';
import { CatalogItem, CatalogKind } from '../shared/management.models';
import { TallerService } from '../services/taller.service';
import { CategoriaService } from '../services/categoria.service';
import { WorkshopModalPage } from './workshop-modal/workshop-modal.page';
import { CategoriaModalPage } from './categoria-modal/categoria-modal.page';

@Component({ selector: 'app-set-up', templateUrl: './set-up.page.html', styleUrls: ['../shared/management.scss', './set-up.page.scss'], standalone: true, imports: [CommonModule, RouterModule, IonContent, IonIcon] })
export class SetUpPage implements OnDestroy {
  workshops: CatalogItem[] = []; categorias: CatalogItem[] = [];
  loadingWorkshops = false; loadingCategories = false; workshopError = false; categoryError = false;
  openingModal = false; actionError = ''; successMessage = '';
  private readonly destroyed = new Subject<void>();
  constructor(private talleres: TallerService, private categories: CategoriaService, private modalCtrl: ModalController) {
    addIcons({ arrowBackOutline, busOutline, chevronForwardOutline, constructOutline, folderOutline, optionsOutline, pricetagOutline, refreshOutline });
  }
  ionViewWillEnter(): void { this.loadWorkshops(); this.loadCategorias(); }
  loadWorkshops(): void {
    if (this.loadingWorkshops) return;
    this.loadingWorkshops = true; this.workshopError = false;
    this.talleres.getAll().pipe(takeUntil(this.destroyed)).subscribe({ next: data => { this.workshops = data; this.loadingWorkshops = false; }, error: () => { this.workshopError = true; this.loadingWorkshops = false; } });
  }
  loadCategorias(): void {
    if (this.loadingCategories) return;
    this.loadingCategories = true; this.categoryError = false;
    this.categories.getAll().pipe(takeUntil(this.destroyed)).subscribe({ next: data => { this.categorias = data; this.loadingCategories = false; }, error: () => { this.categoryError = true; this.loadingCategories = false; } });
  }
  async open(kind: CatalogKind): Promise<void> {
    if (this.openingModal) return;
    this.openingModal = true; this.actionError = ''; this.successMessage = '';
    try {
      const modal = await this.modalCtrl.create({ component: kind === 'workshops' ? WorkshopModalPage : CategoriaModalPage, cssClass: 'catalog-list-modal' });
      await modal.present(); const { data } = await modal.onDidDismiss();
      if (kind === 'workshops') this.loadWorkshops(); else this.loadCategorias();
      if (data?.changed) this.successMessage = 'Configuración actualizada.';
    } catch { this.actionError = 'No pudimos abrir esta sección. Vuelve a intentarlo.'; }
    finally { this.openingModal = false; }
  }
  openWorkshopModal(): Promise<void> { return this.open('workshops'); }
  openCategoriashopModal(): Promise<void> { return this.open('categories'); }
  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}
