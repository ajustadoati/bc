import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonList, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController } from '@ionic/angular';
import { VehicleTypeService } from 'src/app/services/vehicle-type.service';


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

  vehicleTypes: { id: string, type: string }[] = [];

  // Objeto para almacenar los datos del formulario
  nuevoVehiculo = {
    numberId: '',
      marca: '',
      model: '',
      serial: '',
      company: '',
      userId: '',
      vehicleType: 0
  };

  constructor(private vehiculoService: VehiculoService, private authService: AuthService, private modalCtrl: ModalController,
    private vehicleTypeService: VehicleTypeService
  ) {}

  // Método para agregar un vehículo
  agregarVehiculo() {
    console.log("Agregando vehiculo",this.nuevoVehiculo);
    this.nuevoVehiculo.userId = this.authService.getUserId();
    if (this.validarVehiculo(this.nuevoVehiculo)) {
      // Enviar al servicio
      this.vehiculoService.agregarVehiculo(this.nuevoVehiculo).subscribe({
        next: (response) => {
          alert('Vehículo agregado correctamente');
          this.vehiculos.push(response); // Agregar a la lista local si es necesario
          this.limpiarFormulario();
        },
        error: (err) => {
          alert('Error al agregar vehículo');
          console.error(err);
        }
      });
    } else {
      alert('Por favor, completa correctamente los campos.');
    }
  }

  validarVehiculo(vehiculo: any): boolean {
    return true;
  }

  limpiarFormulario() {
    this.nuevoVehiculo = {
      numberId: '',
      marca: '',
      model: '',
      serial: '',
      company: '',
      userId: '',
      vehicleType: 0
    };
  }
  ngOnInit() {
    this.obtenerVehiculos();
    this.vehicleTypeService.getTipoVehiculos().subscribe(types => {
      this.vehicleTypes = types;
    }); // Cargar los vehículos al abrir la página
  }

  obtenerVehiculos() {

    let userId = this.authService.getUserId();
    this.vehiculoService.getVehiculos(userId).subscribe({
      next: (data) => {
        this.vehiculos = data;
      },
      error: (err) => {
        console.error('Error obteniendo vehículos', err);
      }
    });
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

}
