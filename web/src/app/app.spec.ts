import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    }).compileComponents();
  });

  it('should render the application navigation and dashboard by default with hash routing', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/dashboard');
    expect(element.querySelector('a[href="#/dashboard"]')).toBeTruthy();
    expect(element.querySelector('a[href="#/settings"]')).toBeTruthy();
    expect(element.querySelector('a.menu-active[href="#/dashboard"]')).toBeTruthy();
    expect(element.textContent).toContain('Dashboard page placeholder');
  });

  it('should navigate to the settings form and mark its route active', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/settings');
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Instrument count');
    expect(element.querySelector('input[name="instrumentCount"]')).toBeTruthy();
    expect(element.querySelector('a.menu-active[href="#/settings"]')).toBeTruthy();
  });

  it('should toggle mobile drawer and close it after selecting a navigation link', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const openBtn = element.querySelector<HTMLButtonElement>('button[aria-label="Open navigation"]');
    const drawerCheckbox = element.querySelector<HTMLInputElement>('#navigation-drawer');

    expect(openBtn).toBeTruthy();
    expect(openBtn?.getAttribute('aria-expanded')).toBe('false');
    expect(drawerCheckbox?.checked).toBe(false);

    openBtn?.click();
    fixture.detectChanges();

    expect(openBtn?.getAttribute('aria-expanded')).toBe('true');
    expect(drawerCheckbox?.checked).toBe(true);

    const settingsLink = element.querySelector<HTMLAnchorElement>('aside a[href="#/settings"]');
    settingsLink?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(openBtn?.getAttribute('aria-expanded')).toBe('false');
    expect(drawerCheckbox?.checked).toBe(false);
  });
});
