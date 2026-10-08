import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, createOutline, walletOutline } from 'ionicons/icons';
import { FleetVehicle } from '../vehicle.models';

@Component({
  selector: 'app-vehiculos-details',
  templateUrl: './vehiculos-details.page.html',
  styleUrls: ['./vehiculos-details.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonFooter, IonIcon]
})
export class VehiculosDetailsPage {
  @Input() vehiculo: FleetVehicle | null = null;
  @Input() typeName = 'Sin clasificar';
  constructor(private modalCtrl: ModalController, private router: Router) {
    addIcons({ closeOutline, createOutline, walletOutline });
  }
  async cerrarModal() {
    const modal = await this.modalCtrl.getTop();
    if (modal) await this.modalCtrl.dismiss(null, 'cancel');
    else await this.router.navigate(['/vehiculos']);
  }
  editar() { this.modalCtrl.dismiss(null, 'edit'); }
  async verGastos() {
    if (!this.vehiculo) return;
    await this.modalCtrl.dismiss(null, 'expenses');
    await this.router.navigate(['/vehiculos', this.vehiculo.id, 'gastos']);
  }
}
