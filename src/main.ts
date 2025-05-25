import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth-interceptor.service';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cashOutline, cardOutline, carOutline, cogOutline, logOutOutline, carSportOutline, settingsOutline, peopleOutline } from 'ionicons/icons';

addIcons({
  'cash-outline': cashOutline,
  'car-outline': carOutline,
  'cog-outline': cogOutline,
  'log-out-outline': logOutOutline,
  'card-outline': cardOutline,
  'car-sport-outline':carSportOutline,
  'settings-outline': settingsOutline,
  'people-outline': peopleOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    ModalController, AlertController
  ],
});
