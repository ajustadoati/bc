import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'ingresos',
    loadComponent: () => import('./ingresos/ingresos.page').then(m => m.IngresosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'gastos',
    loadComponent: () => import('./gastos/gastos.page').then(m => m.GastosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehiculos',
    loadComponent: () => import('./vehiculos/vehiculos.page').then(m => m.VehiculosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehiculos/:vehicleId/gastos',
    loadComponent: () => import('./gastos/gastos-list/gastos-list/gastos-list.page').then(m => m.GastosListPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehiculos/:vehicleId/gastos/nuevo',
    loadComponent: () => import('./gastos/gastos-crear/crear/crear.page').then(m => m.CrearPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'operadores',
    loadComponent: () => import('./operadores/operadores.page').then(m => m.OperadoresPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'crear-operadores',
    loadComponent: () => import('./operadores/crear/crear.page').then(m => m.CrearPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'crear',
    loadComponent: () => import('./vehiculos/crear/crear/crear.page').then(m => m.CrearPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'diario',
    loadComponent: () => import('./ingresos/diario/diario.page').then( m => m.DiarioPage)
  },
  {
    path: 'detalle',
    loadComponent: () => import('./ingresos/detalle/detalle/detalle.page').then( m => m.DetallePage)
  },
  {
    path: 'gastos-list',
    loadComponent: () => import('./gastos/gastos-list/gastos-list/gastos-list.page').then( m => m.GastosListPage)
  },
  {
    path: 'crear',
    loadComponent: () => import('./gastos/gastos-crear/crear/crear.page').then( m => m.CrearPage)
  },
  {
    path: 'set-up',
    loadComponent: () => import('./set-up/set-up.page').then( m => m.SetUpPage)
  },  {
    path: 'workshop-modal',
    loadComponent: () => import('./set-up/workshop-modal/workshop-modal.page').then( m => m.WorkshopModalPage)
  },
  {
    path: 'add-workshop-modal',
    loadComponent: () => import('./set-up/add-workshop-modal/add-workshop-modal.page').then( m => m.AddWorkshopModalPage)
  },
  {
    path: 'categoria-modal',
    loadComponent: () => import('./set-up/categoria-modal/categoria-modal.page').then( m => m.CategoriaModalPage)
  },
  {
    path: 'addcategoria-modal',
    loadComponent: () => import('./set-up/addcategoria-modal/addcategoria-modal.page').then( m => m.AddcategoriaModalPage)
  }


];
