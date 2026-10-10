import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PROJECT_NAME } from '../../core/constants';

@Component({
  imports: [RouterLink, RouterLinkActive],
  host: { class: 'drawer-side z-20' },
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebar {
  protected readonly projectName = PROJECT_NAME;
}
