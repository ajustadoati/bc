import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonItem, IonButton,IonLabel,IonSelectOption,IonInput } from '@ionic/angular/standalone';
import { FormsModule,FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CategoriaService } from 'src/app/services/categoria.service';
import { TipoGastoService } from 'src/app/services/tipo-gasto.service';

@Component({
  selector: 'app-add-sub-categoria-modal',
  templateUrl: './add-sub-categoria-modal.page.html',
  styleUrls: ['./add-sub-categoria-modal.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonButton, IonItem, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonLabel,IonSelectOption,IonInput]
})
export class AddSubCategoriaModalPage implements OnInit {
  @Input() categoriaId!: number;
  @Input() categoriaName!: string; 

  formAddSubCategoria!: FormGroup;
  categoriasDisponibles: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private tipoGastoService: TipoGastoService

  ) {}

  ngOnInit() {
    this.formAddSubCategoria = this.fb.group({
      name: ['', Validators.required],
      expenseCategoryId: ['', Validators.required] 
    });

    this.loadCategorias();
  }

  onCategoriaChange(event: any) {
    const categoriaSeleccionada = event.detail.value;
    this.formAddSubCategoria.controls['expenseCategoryId'].setValue(categoriaSeleccionada);
  }  

  loadCategorias() {
    this.categoriaService.getAll().subscribe(data => {
      this.categoriasDisponibles = data;
      console.log(data)
    });
  }

  submitForm() {
    console.log("Valor del formulario:", this.formAddSubCategoria.value);
    
    if (this.formAddSubCategoria.valid) {
      this.tipoGastoService.addSubCategoria(this.formAddSubCategoria.value).subscribe({
        next: (response) => {
          console.log('Subcategoría creada:', response);
          this.modalCtrl.dismiss({ newSubCategoria: response });
        },
        error: (err) => {
          console.error('Error al crear subcategoría', err);
        }
      });
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

