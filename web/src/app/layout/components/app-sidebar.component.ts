import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  host: { class: 'drawer-side z-20' },
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebar {
  readonly navigationSelected = output<void>();
}
