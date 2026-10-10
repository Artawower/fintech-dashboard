import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './app-header.component';
import { AppSidebar } from './components/app-sidebar.component';

@Component({
  imports: [AppHeader, AppSidebar, RouterOutlet],
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
})
export class AppLayout {
  protected readonly navigationOpen = signal(false);
}
