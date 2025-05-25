import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ModalController, IonLabel, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonItem, IonSelect, IonSelectOption, IonIcon } from '@ionic/angular/standalone';
import { OperadorService } from 'src/app/services/operador.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButtons, IonCardTitle, IonCardHeader, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardTitle, IonCardContent, 
    IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonButtons]
})
export class CrearPage implements OnInit {

  operadores: any[] = [];

  vehicleTypes: { id: string, type: string }[] = [];

  // Objeto para almacenar los datos del formulario
  nuevoOperador = {
    numberId: '',
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      rol: '',
      companyId: 0
  };
  types: { id: string, type: string }[] = [{id: '2', type: 'CONDUCTOR'}, {id: '3', type: 'COLECTOR'}];

  constructor(private operadorService: OperadorService, private userService: UserService, private authService:AuthService, private modalCtrl: ModalController
  ) {}

  // Método para agregar un vehículo
  agregarOperador() {
    console.log("Agregando operador",this.nuevoOperador);
 

    let user = this.authService.getUser();
    if (user) {
      this.nuevoOperador.companyId = user.companyId;
      this.operadorService.agregarOperador(this.nuevoOperador).subscribe({
        next: (response) => {
          alert('Usuario agregado correctamente');
          this.operadores.push(response); // Agregar a la lista local si es necesario
          this.obtenerOperadores();
          this.limpiarFormulario();
        },
        error: (err) => {
          alert('Error al agregar usuario');
          console.error(err);
        }
      });
    } else {
      console.error('Usuario no encontrado');
    }
      // Enviar al servicio
      
    
  }


  limpiarFormulario() {
    this.nuevoOperador = {
      numberId: '',
        firstName: '',
        lastName: '',
        mobileNumber: '',
        email: '',
        rol: '',
        companyId: 0
    };
  }
  ngOnInit() {
    this.obtenerOperadores();
  }

  obtenerOperadores() {

    let userId = this.authService.getUserId();
    this.operadorService.getOperadores(userId).subscribe({
      next: (data) => {
        this.operadores = data;
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
