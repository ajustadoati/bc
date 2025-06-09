import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonRow, IonGrid, IonCardHeader, 
  IonCardTitle, IonCol, IonBackButton, IonIcon } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-vehiculos-details',
  templateUrl: './vehiculos-details.page.html',
  styleUrls: ['./vehiculos-details.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, 
    IonCardContent, IonRow, IonGrid, IonCardHeader, IonCardTitle, IonCol, IonIcon] 
})
export class VehiculosDetailsPage implements OnInit {
  @Input() vehiculo: any;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    console.log('Vehículo recibido:', this.vehiculo);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
