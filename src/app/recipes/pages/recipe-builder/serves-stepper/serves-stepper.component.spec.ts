import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ServesStepperComponent } from './serves-stepper.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ServesStepperComponent],
  template: `<label for="serves">Serves</label><app-serves-stepper [formControl]="serves" />`,
})
class HostComponent {
  serves = new FormControl<number | null>(4);
}

describe('ServesStepperComponent', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      input: el.querySelector('input')!,
      minus: el.querySelector<HTMLButtonElement>('[aria-label="Fewer servings"]')!,
      plus: el.querySelector<HTMLButtonElement>('[aria-label="More servings"]')!,
    };
  }

  it('shows the value and is labelled "Serves"', () => {
    const { input, fixture } = setup();
    expect(input.value).toBe('4');
    const label = (fixture.nativeElement as HTMLElement).querySelector('label')!;
    expect(label.htmlFor).toBe(input.id);
  });

  it('+ and − change the value within 1–99', () => {
    const { host, minus, plus, fixture } = setup();
    plus.click();
    expect(host.serves.value).toBe(5);
    host.serves.setValue(1);
    fixture.detectChanges();
    expect(minus.disabled).toBeTrue();
    host.serves.setValue(99);
    fixture.detectChanges();
    expect(plus.disabled).toBeTrue();
  });

  it('typing keeps digits only and caps at 99; empty stays empty', () => {
    const { host, input } = setup();
    input.value = '1a2';
    input.dispatchEvent(new Event('input'));
    expect(host.serves.value).toBe(12);
    input.value = '150';
    input.dispatchEvent(new Event('input'));
    expect(host.serves.value).toBe(99);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(host.serves.value).toBeNull();
  });

  it('↑ and ↓ step the value', () => {
    const { host, input } = setup();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(host.serves.value).toBe(5);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(host.serves.value).toBe(3);
  });
});
