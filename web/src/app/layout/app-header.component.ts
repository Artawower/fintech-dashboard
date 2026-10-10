import { Component } from '@angular/core';
import { PROJECT_NAME } from '../core/constants';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
})
export class AppHeader {
  protected readonly projectName = PROJECT_NAME;
}
