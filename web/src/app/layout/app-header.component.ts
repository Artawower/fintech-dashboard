import { Component, input, output } from '@angular/core';
import { PROJECT_NAME } from '../core/constants';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
})
export class AppHeader {
  public readonly isNavigationOpen = input.required<boolean>();
  public readonly openNavigation = output<void>();

  protected readonly projectName = PROJECT_NAME;
}
