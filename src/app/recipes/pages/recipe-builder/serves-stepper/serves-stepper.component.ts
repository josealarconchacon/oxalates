import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';

export const MIN_SERVES = 1;
export const MAX_SERVES = 99;

/** [− value +] for "Serves". Typing is allowed; ↑/↓ step too. null = empty. */
@Component({
  selector: 'app-serves-stepper',
  standalone: true,
  imports: [IconComponent],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ServesStepperComponent), multi: true },
  ],
  template: `
    <div class="stepper" [class.invalid]="invalid">
      <button type="button" class="step" aria-label="Fewer servings"
        [disabled]="disabled || (value ?? 0) <= min" (click)="step(-1)">
        <app-icon name="minus" [size]="18" />
      </button>
      <input class="value" type="text" inputmode="numeric" autocomplete="off" maxlength="2"
        [id]="inputId" [value]="value ?? ''" [disabled]="disabled"
        [attr.aria-invalid]="invalid || null" [attr.aria-describedby]="describedBy || null"
        (input)="onType($any($event.target))" (blur)="onTouched()"
        (keydown.arrowup)="step(1); $event.preventDefault()"
        (keydown.arrowdown)="step(-1); $event.preventDefault()" />
      <button type="button" class="step" aria-label="More servings"
        [disabled]="disabled || (value ?? 0) >= max" (click)="step(1)">
        <app-icon name="plus" [size]="18" />
      </button>
    </div>
  `,
  styles: `
    .stepper {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 52px;
      padding: 4px;
      border: 1px solid var(--color-line);
      border-radius: 14px;
      background: var(--rb-input, var(--color-surface));
    }
    .stepper.invalid { border-color: var(--rb-danger, #b42318); }
    .step {
      display: grid;
      flex-shrink: 0;
      place-items: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: 0;
      border-radius: 10px;
      background: var(--rb-surface-2, #f1f4f0);
      color: var(--color-ink);
      cursor: pointer;
      --icon-stroke: 2;
    }
    .step:disabled { cursor: not-allowed; opacity: 0.45; }
    .value {
      width: 100%;
      min-width: 2.5ch;
      height: 44px;
      border: 0;
      background: transparent;
      color: var(--color-ink);
      font: inherit;
      font-size: 1.0625rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      text-align: center;
    }
    .step:focus-visible, .value:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 1px;
    }
  `,
})
export class ServesStepperComponent implements ControlValueAccessor {
  @Input() inputId = 'serves';
  @Input() describedBy: string | null = null;
  @Input() invalid = false;

  readonly min = MIN_SERVES;
  readonly max = MAX_SERVES;
  value: number | null = MIN_SERVES;
  disabled = false;

  private onChange: (value: number | null) => void = () => {};
  onTouched: () => void = () => {};

  step(delta: number): void {
    if (this.disabled) return;
    this.set(clamp((this.value ?? 0) + delta));
  }

  /** Digits only; an empty box stays empty so the error can say so. */
  onType(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '');
    const value = digits ? Math.min(Number(digits), MAX_SERVES) : null;
    input.value = value === null ? '' : String(value);
    this.set(value);
  }

  writeValue(value: number | null): void {
    this.value = value;
  }
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  private set(value: number | null): void {
    this.value = value;
    this.onChange(value);
  }
}

function clamp(n: number): number {
  return Math.min(MAX_SERVES, Math.max(MIN_SERVES, n));
}
