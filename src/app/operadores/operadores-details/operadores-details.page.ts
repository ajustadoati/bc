import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonFooter, IonHeader, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { callOutline, closeOutline, idCardOutline, personOutline, trashOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { OperadorService } from '../../services/operador.service';
import { Operator, operatorInitials, operatorName, roleLabel } from '../operator.models';
import { emailHref, phoneHref } from '../../shared/management.models';

@Component({ selector: 'app-operadores-details', templateUrl: './operadores-details.page.html', styleUrls: ['../../shared/management.scss', './operadores-details.page.scss'], standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonFooter, IonIcon] })
export class OperadoresDetailsPage {
  @Input() operador: Operator | null = null;
  isDeleting = false; isConfirming = false; deleteError = '';
  readonly name = operatorName; readonly initials = operatorInitials; readonly role = roleLabel; readonly phone = phoneHref; readonly email = emailHref;
  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController, private service: OperadorService, private router: Router) {
    addIcons({ callOutline, closeOutline, idCardOutline, personOutline, trashOutline });
  }
  get busy(): boolean { return this.isDeleting || this.isConfirming; }
  async ionViewDidEnter(): Promise<void> { const modal = await this.modalCtrl.getTop(); if (modal) modal.canDismiss = async (_data, role) => !this.busy || role === 'deleted'; }
  async eliminar(): Promise<void> {
    if (!this.operador?.id || this.busy || this.operador.type === 'ADMIN') return;
    this.isConfirming = true; this.deleteError = '';
    try {
      const alert = await this.alertCtrl.create({ header: '¿Eliminar este operador?', message: 'Se quitará este operador del equipo. Esta acción no se puede deshacer.', buttons: [{ text: 'Conservar operador', role: 'cancel' }, { text: 'Eliminar operador', role: 'confirm' }] });
      await alert.present();
      const { role } = await alert.onDidDismiss();
      if (role !== 'confirm') return;
      this.isDeleting = true;
      await firstValueFrom(this.service.eliminarOperador(String(this.operador.id)));
      const modal = await this.modalCtrl.getTop();
      if (modal) await modal.dismiss({ deleted: this.operador.id }, 'deleted'); else await this.router.navigate(['/operadores']);
    } catch (error) {
      const status = (error as { status?: number })?.status;
      this.deleteError = status === 409 ? 'El operador está asociado a otros registros y no se puede eliminar. Su ficha se conserva.' : 'No pudimos eliminar el operador. Su ficha se conserva. Vuelve a intentarlo.';
    } finally { this.isDeleting = false; this.isConfirming = false; }
  }
  async cerrarModal(): Promise<void> { if (this.busy) return; const modal = await this.modalCtrl.getTop(); if (modal) await modal.dismiss(null, 'cancel'); else await this.router.navigate(['/operadores']); }
}
