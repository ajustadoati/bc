import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel,IonButton,IonItem ,IonInput} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { TallerService } from 'src/app/services/taller.service';

@Component({
  selector: 'app-add-workshop-modal',
  templateUrl: './add-workshop-modal.page.html',
  styleUrls: ['./add-workshop-modal.page.scss'],
  standalone: true,
  imports: [IonLabel, IonContent, CommonModule, FormsModule,IonButton,IonItem,ReactiveFormsModule,IonInput]
})
export class AddWorkshopModalPage implements OnInit {
  formWorkshop!: FormGroup;

  constructor(private modalCtrl: ModalController, private fb: FormBuilder, private tallerService: TallerService) {}

  ngOnInit() {
    this.formWorkshop = this.fb.group({
      name: ['', Validators.required],  
      mobileNumber: ['', Validators.required]  
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
  
  submitForm() {
    console.log("Estado del formulario:", this.formWorkshop.valid);
    console.log("Valor del formulario:", this.formWorkshop.value);
  
    if (this.formWorkshop.valid) {
      this.tallerService.createWorkshop(this.formWorkshop.value).subscribe({
        next: (response) => {
          console.log('Taller creado:', response);
          this.modalCtrl.dismiss({ newWorkshop: response });
        },
        error: (err) => {
          console.error('Error al crear taller', err);
        }
      });
    }
  }

  
}

  











