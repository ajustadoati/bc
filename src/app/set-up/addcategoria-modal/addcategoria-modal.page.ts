import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel,IonButton,IonItem ,IonInput,IonCardHeader,IonCardTitle,IonCardContent,IonCard,IonIcon, IonButtons } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CategoriaService } from 'src/app/services/categoria.service'

@Component({
  selector: 'app-addcategoria-modal',
  templateUrl: './addcategoria-modal.page.html',
  styleUrls: ['./addcategoria-modal.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, CommonModule, FormsModule,IonLabel, IonContent, CommonModule, FormsModule,IonButton,IonItem,ReactiveFormsModule,IonInput, IonContent, IonHeader, IonTitle, IonToolbar
    , IonCard,IonCardContent, IonIcon
  ]
})
export class AddcategoriaModalPage implements OnInit {
  formAddCategorias!: FormGroup;

  constructor(private modalCtrl: ModalController, private fb: FormBuilder, private categoriaService: CategoriaService ) {}

  ngOnInit() {
    this.formAddCategorias = this.fb.group({
      name: ['', Validators.required],  
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  submitForm() {
    if (this.formAddCategorias.valid) {
      console.log("Datos del formulario antes de enviar:", this.formAddCategorias.value);
  
      this.categoriaService.createCategoria(this.formAddCategorias.value).subscribe({
        next: (response) => {
          console.log('Categoría creada:', response);
          this.modalCtrl.dismiss({ newCategoria: response });
        },
        error: (err) => {
          console.error('Error al crear categoría', err);
        }
      });
    }
  }

}
