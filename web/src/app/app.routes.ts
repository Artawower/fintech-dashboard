import { Routes } from '@angular/router';
import { PROJECT_NAME } from './core/constants';
import { AppLayout } from './layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page.component').then((module) => module.DashboardPage),
        title: `Dashboard | ${PROJECT_NAME}`,
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings-page.component').then((module) => module.SettingsPage),
        title: `Settings | ${PROJECT_NAME}`,
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
