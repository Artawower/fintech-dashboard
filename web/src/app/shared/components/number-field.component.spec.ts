import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { integerValidator } from '../validators/integer.validator';
import { NumberField } from './number-field.component';

@Component({
  imports: [NumberField, ReactiveFormsModule],
  template: `
    <app-number-field
      inputId="test-field"
      inputName="testField"
      label="Test Field"
      [control]="control"
      [min]="10"
      [max]="100"
      rangeUnit="items"
      [errorUnit]="errorUnit"
      [suffix]="suffix"
    />
  `,
})
class TestHost {
  readonly control = new FormControl<number>(20, {
    nonNullable: true,
    validators: [Validators.required, integerValidator, Validators.min(10), Validators.max(100)],
  });
  suffix = '';
  errorUnit = '';
}

describe('NumberField', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
  });

  it('should render label, input, and range help text with accessible attributes', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const label = element.querySelector<HTMLElement>('#test-field-label');
    const input = element.querySelector<HTMLInputElement>('#test-field');
    const help = element.querySelector<HTMLElement>('#test-field-help');

    expect(label?.textContent?.trim()).toBe('Test Field');
    expect(input?.value).toBe('20');
    expect(input?.getAttribute('aria-labelledby')).toBe('test-field-label');
    expect(input?.getAttribute('aria-describedby')).toBe('test-field-help test-field-error');
    expect(help?.textContent).toContain('Allowed range: 10–100 items.');
  });

  it('should render suffix element when suffix is provided', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.suffix = 'ms';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const suffixElement = element.querySelector('.btn.join-item');
    expect(suffixElement?.textContent?.trim()).toBe('ms');
  });

  it('should show unified error message for required, integer, min, and max', () => {
    const fixture = TestBed.createComponent(TestHost);
    const host = fixture.componentInstance;
    host.errorUnit = 'ms';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    // Required
    host.control.setValue(null as unknown as number);
    host.control.markAsTouched();
    fixture.detectChanges();
    expect(element.querySelector('#test-field-error')?.textContent).toContain('Test Field is required.');

    // Integer
    host.control.setValue(15.5);
    fixture.detectChanges();
    expect(element.querySelector('#test-field-error')?.textContent).toContain(
      'Test Field must be an integer.',
    );

    // Min
    host.control.setValue(5);
    fixture.detectChanges();
    expect(element.querySelector('#test-field-error')?.textContent).toContain(
      'Test Field must be at least 10 ms.',
    );

    // Max
    host.control.setValue(150);
    fixture.detectChanges();
    expect(element.querySelector('#test-field-error')?.textContent).toContain(
      'Test Field must not exceed 100 ms.',
    );
  });
});
