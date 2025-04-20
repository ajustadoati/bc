import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton, IonItem, IonList, IonLabel} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { VehiculoService } from '../services/vehiculo.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.page.html',
  styleUrls: ['./gastos.page.scss'],
  standalone: true,
  imports: [IonItem, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons,IonList, IonLabel]
})
export class GastosPage implements OnInit {

  vehicles: any[] = [];
  user: any;

  constructor(private modalCtrl: ModalController, 
    private vehiculoService: VehiculoService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.vehiculoService.getVehiculos(this.user.id).subscribe(data => this.vehicles = data);
  }

  goToExpenses(vehicleId: number) {
    console.log("click");
    this.router.navigate(['/vehiculos', vehicleId, "gastos"]);
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'refresh');
  }

}
