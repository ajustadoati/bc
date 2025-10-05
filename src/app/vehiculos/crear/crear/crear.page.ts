import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonList, IonBackButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController } from '@ionic/angular';
import { VehicleTypeService } from 'src/app/services/vehicle-type.service';


@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButtons, IonCardTitle, IonCardHeader, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonButtons],
})
export class CrearPage implements OnInit {

  @Input() vehiculoEditar: any = null;
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

  // Método para agregar o actualizar un vehículo
  agregarVehiculo() {
    console.log("Guardando vehiculo", this.nuevoVehiculo);
    this.nuevoVehiculo.userId = this.authService.getUserId();
    if (this.validarVehiculo(this.nuevoVehiculo)) {
      if (this.vehiculoEditar) {
        // Actualizar vehículo existente
        this.vehiculoService.actualizarVehiculo(this.vehiculoEditar.id, this.nuevoVehiculo).subscribe({
          next: (response) => {
            alert('Vehículo actualizado correctamente');
            this.cerrar();
          },
          error: (err) => {
            alert('Error al actualizar vehículo');
            console.error(err);
          }
        });
      } else {
        // Crear nuevo vehículo
        this.vehiculoService.agregarVehiculo(this.nuevoVehiculo).subscribe({
          next: (response) => {
            alert('Vehículo agregado correctamente');
            this.vehiculos.push(response);
            this.limpiarFormulario();
            this.cerrar();
          },
          error: (err) => {
            alert('Error al agregar vehículo');
            console.error(err);
          }
        });
      }
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
    });

    // Si es edición, cargar datos del vehículo
    if (this.vehiculoEditar) {
      console.log('Vehiculo a editar:', this.vehiculoEditar);
      this.nuevoVehiculo = {
        numberId: this.vehiculoEditar.numberId,
        marca: this.vehiculoEditar.marca,
        model: this.vehiculoEditar.model,
        serial: this.vehiculoEditar.serial,
        company: this.vehiculoEditar.company,
        userId: this.vehiculoEditar.userId || this.authService.getUserId(),
        vehicleType: this.vehiculoEditar.vehicleType
      };
    }
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
