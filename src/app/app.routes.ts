import { Routes } from '@angular/router';
import { accessGuard } from './core/session';

export const routes: Routes = [
  { path: 'login', title: 'Ingreso · Registro Estudiantil', loadComponent: () => import('./features/login/login').then(m => m.Login) },
  { path: 'registro', title: 'Registro · Registro Estudiantil', loadComponent: () => import('./features/register/register').then(m => m.Register) },
  { path: '', pathMatch: 'full', canActivate: [accessGuard], loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'perfil', title: 'Mi perfil', canActivate: [accessGuard], loadComponent: () => import('./features/profile/profile').then(m => m.Profile) },
  { path: 'usuarios', title: 'Usuarios', canActivate: [accessGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/users/users').then(m => m.Users) },
  { path: 'roles', title: 'Roles', canActivate: [accessGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/roles/roles').then(m => m.Roles) },
  { path: 'materias', title: 'Materias', canActivate: [accessGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/subjects/subjects').then(m => m.Subjects) },
  { path: 'profesor', title: 'Mis materias', canActivate: [accessGuard], data: { roles: ['Professor'] }, loadComponent: () => import('./features/subjects/subjects').then(m => m.Subjects) },
  { path: 'profesor/materias/:subjectId/alumnos', title: 'Alumnos', canActivate: [accessGuard], data: { roles: ['Professor'], professor: true }, loadComponent: () => import('./features/names/names').then(m => m.Names) },
  { path: 'inscripcion', title: 'Mi inscripción', canActivate: [accessGuard], data: { roles: ['Student'] }, loadComponent: () => import('./features/enrollment/enrollment').then(m => m.Enrollment) },
  { path: 'inscripcion/materias/:subjectId/companeros', title: 'Compañeros', canActivate: [accessGuard], data: { roles: ['Student'] }, loadComponent: () => import('./features/names/names').then(m => m.Names) },
  { path: 'inscripciones/:userId', title: 'Gestionar inscripción', canActivate: [accessGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/enrollment/enrollment').then(m => m.Enrollment) },
  { path: 'inscripciones/:userId/materias/:subjectId/companeros', title: 'Compañeros', canActivate: [accessGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/names/names').then(m => m.Names) },
  { path: 'estudiantes', title: 'Estudiantes', canActivate: [accessGuard], loadComponent: () => import('./features/students/students').then(m => m.Students) },
  { path: '**', redirectTo: '' }
];
