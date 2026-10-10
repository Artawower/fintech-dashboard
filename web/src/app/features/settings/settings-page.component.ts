import { Component } from '@angular/core';
import { GeneratorSettings } from './components/generator-settings.component';

@Component({
  imports: [GeneratorSettings],
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
})
export class SettingsPage {}
