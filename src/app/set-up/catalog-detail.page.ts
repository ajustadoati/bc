import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, constructOutline, pricetagOutline, informationCircleOutline } from 'ionicons/icons';
import { CatalogItem, CatalogKind, phoneHref } from '../shared/management.models';
@Component({ selector: 'app-catalog-detail', templateUrl: './catalog-detail.page.html', styleUrls: ['../shared/management.scss'], standalone: true, imports: [CommonModule, IonContent, IonHeader, IonFooter, IonIcon] })
export class CatalogDetailPage {
  @Input() item: CatalogItem | null = null;
  @Input() kind: CatalogKind = 'workshops';
  @Input() categoryName = '';
  readonly phone = phoneHref;
  constructor(private modalCtrl: ModalController, private router: Router) { addIcons({ closeOutline, constructOutline, pricetagOutline, informationCircleOutline }); }
  async close(): Promise<void> { const modal = await this.modalCtrl.getTop(); if (modal) await modal.dismiss(null, 'cancel'); else await this.router.navigate(['/set-up']); }
}
