import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonList, IonBackButton, IonButtons } from '@ionic/angular/standalone';


@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [IonButtons, IonCardTitle, IonCardHeader, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardTitle, IonCardContent, 
    IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonList, IonButtons,  IonBackButton ],
})
export class CrearPage implements OnInit {

  vehiculos: any[] = [];

  // Objeto para almacenar los datos del formulario
  nuevoVehiculo = {
    marca: '',
    modelo: '',
    anio: null,
    tipo: ''
  };

  constructor() {}

  // Método para agregar un vehículo
  agregarVehiculo() {
    if (this.nuevoVehiculo.marca && this.nuevoVehiculo.modelo && this.nuevoVehiculo.anio && this.nuevoVehiculo.tipo) {
      // Agrega el vehículo a la lista
      this.vehiculos.push({ ...this.nuevoVehiculo });

      // Limpia el formulario
      this.nuevoVehiculo = {
        marca: '',
        modelo: '',
        anio: null,
        tipo: ''
      };
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }

  ngOnInit() {
  }

}
