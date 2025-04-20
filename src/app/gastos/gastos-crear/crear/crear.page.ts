import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonList, IonItem, IonLabel, IonBackButton, IonSelectOption, IonSelect, IonInput} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { GastoService } from 'src/app/services/gasto.service';
import { ModalController } from '@ionic/angular';
import { TipoGastoService } from 'src/app/services/tipo-gasto.service';
import { TallerService } from 'src/app/services/taller.service';
import { CategoriaService } from 'src/app/services/categoria.service';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonItem, IonLabel, IonSelectOption, FormsModule,
    ReactiveFormsModule, IonSelectOption, IonSelect, IonInput  ]
})
export class CrearPage implements OnInit {
  formGasto: FormGroup;
  vehicleId!: number;
  expenseTypes: any[] = [];
  workshops: any[] = [];
  categories: any[]=[];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private gastoService: GastoService,
    private modalCtrl: ModalController,
    private tallerService: TallerService,
    private tipoGastoService: TipoGastoService,
    private categoriaService: CategoriaService,
    private alertController: AlertController
  ) {
    this.formGasto = this.fb.group({
      expenseTypeId: [null, Validators.required],
      workshopId: [null],
      expenseDate: [formatDate(new Date(), 'yyyy-MM-dd', 'en-US')],
      description: [''],
      kilometer: [null],
      amount: [null],
      labour: [null]
    });

  }

  ngOnInit() {
    this.vehicleId = +this.route.snapshot.paramMap.get('vehicleId')!;
    this.loadCategories();
    this.loadWorkshops();
  }


  loadCategories(){
    this.categoriaService.getAll().subscribe(data => this.categories = data);
  }

  loadWorkshops() {
    this.tallerService.getAll().subscribe(data => this.workshops = data);
  }

  onCategoryChange(categoryId: number) {
    if (!categoryId) {
      this.expenseTypes = [];
      this.formGasto.patchValue({ expenseTypeId: null });
      return;
    }
  
    this.tipoGastoService.getAll(categoryId).subscribe(data => {
      this.expenseTypes = data;
      this.formGasto.patchValue({ expenseTypeId: null }); // Limpiar selección previa
    });
  }

  async submitForm() {
    if (this.formGasto.invalid) {
      await this.showAlert('Formulario incompleto', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    const data = {
      ...this.formGasto.value,
      vehicleId: this.vehicleId
    };

    this.gastoService.crear(data).subscribe({
      next: async (response) => {
        console.log(response);
        await this.showAlert('Éxito', 'Pago diario guardado correctamente.');
        this.router.navigate(['/vehiculos', this.vehicleId, 'gastos']);

      },
      error: async (err) => {
        console.error(err);
        await this.showAlert('Error', 'Error al guardar el pago diario.');
      }
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
  
    await alert.present();
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'refresh');
  }

}
