import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should render the application navigation and dashboard by default', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/dashboard');
    expect(element.querySelector('a[href="/dashboard"]')).toBeTruthy();
    expect(element.querySelector('a[href="/settings"]')).toBeTruthy();
    expect(element.querySelector('a.menu-active[href="/dashboard"]')).toBeTruthy();
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
    expect(element.querySelector('a.menu-active[href="/settings"]')).toBeTruthy();
  });
});
