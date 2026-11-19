import { Component, ElementRef, ViewChild } from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { SERVINGS_MAX, SERVINGS_MIN, SERVINGS_RANGE_MESSAGE, SERVINGS_STEP } from './log-defaults';
import { onRadioKey } from './radio-keys';

export type ServingChoice = 0.5 | 1 | 2 | 'custom';
export const SERVING_CHOICES: { value: ServingChoice; label: string }[] = [
  { value: 0.5, label: '½' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 'custom', label: 'Custom' },
];

/**
 * "Servings": ½ · 1 · 2 · Custom chips (a radiogroup); Custom adds a
 * 0.25-step stepper with its range check. Read `multiplier` and `invalid`.
 */
@Component({
  selector: 'app-servings-field',
  standalone: true,
  imports: [IconComponent],
  template: `
    <span class="label" id="log-servings-label">Servings</span>
    <div class="chips" role="radiogroup" aria-labelledby="log-servings-label">
      @for (c of choices; track c.value) {
        <button type="button" role="radio" class="chip" [attr.aria-checked]="serving === c.value"
          [attr.aria-label]="c.value === 0.5 ? 'Half' : null"
          [tabindex]="serving === c.value ? 0 : -1" (click)="select(c.value)"
          (keydown)="onKey($event)">
          {{ c.label }}
        </button>
      }
    </div>
    @if (serving === 'custom') {
      <div class="stepper">
        <button type="button" class="icon-btn" aria-label="Fewer servings"
          [disabled]="customServings <= min" (click)="step(-1)">
          <app-icon name="minus" [size]="18" />
        </button>
        <input #customInput class="stepper-input" type="text" inputmode="decimal" aria-label="Custom servings"
          [value]="customText" [attr.aria-invalid]="customError"
          [attr.aria-describedby]="customError ? 'log-servings-error' : null"
          (input)="onCustomInput($any($event.target).value)" />
        <button type="button" class="icon-btn" aria-label="More servings"
          [disabled]="customServings >= max" (click)="step(1)">
          <app-icon name="plus" [size]="18" />
        </button>
        <span class="stepper-unit">servings</span>
      </div>
      @if (customError) {
        <p class="field-error" id="log-servings-error" role="alert">{{ rangeMessage }}</p>
      }
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 8px;
      --sf-input: #ffffff;
      --sf-surface-2: #f1f4f0;
      --sf-chip-on-bg: #e6f0ea;
      --sf-ring: #17603f;
      --sf-danger: #b42318;
    }
    :host-context(.dark-theme) {
      --sf-input: #0e1411;
      --sf-surface-2: #1d2621;
      --sf-chip-on-bg: #1b3328;
      --sf-ring: #7fd9aa;
      --sf-danger: #f59b94;
    }
    .label { font-size: 0.9375rem; font-weight: 700; }
    .chips { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .chip {
      min-height: 48px;
      border: 1px solid var(--color-line);
      border-radius: 12px;
      background: var(--sf-input);
      color: var(--color-ink);
      font: inherit;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }
    .chip[aria-checked='true'] { border: 2px solid var(--sf-ring); background: var(--sf-chip-on-bg); }
    .stepper { display: flex; align-items: center; gap: 8px; }
    .icon-btn {
      display: grid;
      place-items: center;
      flex: none;
      width: 44px;
      height: 44px;
      border: 1px solid var(--color-line);
      border-radius: 12px;
      background: var(--sf-surface-2);
      color: var(--color-ink);
      cursor: pointer;
      --icon-stroke: 2;
    }
    .icon-btn:disabled { cursor: default; opacity: 0.45; }
    .stepper-input {
      width: 84px;
      min-height: 44px;
      padding: 0 10px;
      border: 1px solid var(--color-line);
      border-radius: 12px;
      background: var(--sf-input);
      color: var(--color-ink);
      font: inherit;
      font-size: 1rem;
      font-weight: 700;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    .stepper-input[aria-invalid='true'] { border-color: var(--sf-danger); }
    .stepper-unit { color: var(--color-muted); font-size: 0.875rem; }
    .field-error { margin: 0; color: var(--sf-danger); font-size: 0.875rem; font-weight: 600; }
    .chip:focus-visible, .icon-btn:focus-visible, .stepper-input:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 2px;
    }
  `,
})
export class ServingsFieldComponent {
  @ViewChild('customInput') private customInput?: ElementRef<HTMLInputElement>;

  readonly choices = SERVING_CHOICES;
  readonly rangeMessage = SERVINGS_RANGE_MESSAGE;
  readonly min = SERVINGS_MIN;
  readonly max = SERVINGS_MAX;

  serving: ServingChoice = 1;
  /** What's typed in the Custom box; `customServings` is the last valid value. */
  customText = '1';
  customServings = 1;
  customError = false;

  get multiplier(): number {
    return this.serving === 'custom' ? this.customServings : this.serving;
  }

  /** Custom is chosen and its value is out of range. */
  get invalid(): boolean {
    return this.serving === 'custom' && this.customError;
  }

  focusCustom(): void {
    this.customInput?.nativeElement.focus();
  }

  select = (value: ServingChoice) => {
    if (value === 'custom' && this.serving !== 'custom') {
      // Start from what was chosen before, e.g. 2 → "2".
      this.customServings = this.multiplier;
      this.customText = String(this.multiplier);
      this.customError = false;
    }
    this.serving = value;
  };

  onKey(event: KeyboardEvent): void {
    onRadioKey(event, this.choices.map((c) => c.value), this.serving, this.select);
  }

  onCustomInput(text: string): void {
    this.customText = text;
    const n = Number(text.replace(',', '.'));
    const valid = text.trim() !== '' && Number.isFinite(n) && n >= SERVINGS_MIN && n <= SERVINGS_MAX;
    this.customError = !valid;
    if (valid) this.customServings = Math.round(n * 100) / 100;
  }

  /** − / + move to the next 0.25 step, within the limits. */
  step(direction: 1 | -1): void {
    const steps = this.customServings / SERVINGS_STEP;
    const next = (direction > 0 ? Math.floor(steps + 1e-9) + 1 : Math.ceil(steps - 1e-9) - 1) * SERVINGS_STEP;
    this.customServings = Math.min(SERVINGS_MAX, Math.max(SERVINGS_MIN, next));
    this.customText = String(this.customServings);
    this.customError = false;
  }
}
