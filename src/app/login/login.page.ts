import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, busOutline, eyeOutline, eyeOffOutline, checkmarkOutline, lockClosedOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent, IonIcon, RouterModule]
})
export class LoginPage {
    credentials = { username: '', password: '' };
    errorMessage = '';
    isSubmitting = false;
    showPassword = false;
    constructor(private authService: AuthService, private router: Router) {
        addIcons({ arrowForwardOutline, busOutline, eyeOutline, eyeOffOutline, checkmarkOutline, lockClosedOutline });
    }
    login(form: NgForm) {
        if (this.isSubmitting)
            return;
        this.errorMessage = '';
        if (form.invalid) {
            form.control.markAllAsTouched();
            return;
        }
        this.isSubmitting = true;
        this.authService.login(this.credentials).pipe(finalize(() => this.isSubmitting = false)).subscribe({
            next: () => this.router.navigate(['/home']),
            error: (error) => {
                this.errorMessage = error.status === 401 || error.status === 403
                    ? 'El usuario o la contraseña no son correctos. Inténtalo de nuevo.'
                    : 'No pudimos conectar con tu cuenta. Inténtalo de nuevo en unos momentos.';
            }
        });
    }
}
