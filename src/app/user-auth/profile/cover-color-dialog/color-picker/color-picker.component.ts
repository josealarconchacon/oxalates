import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import {
  Rgba,
  clamp,
  hsvToRgb,
  parseCssColor,
  parseHex,
  rgbToHsv,
  toHex,
} from '../color-math';

type Channel = 'r' | 'g' | 'b';
type SliderKind = 'hue' | 'alpha';

let nextId = 0;

/**
 * A small color picker: saturation/brightness area, hue and opacity
 * sliders, an eyedropper (where the browser has one) and Hex/R/G/B/A
 * fields. Every control works with a mouse, touch and the keyboard.
 *
 * It keeps the color as HSV internally, so dragging into grey or black
 * doesn't lose the hue, and emits uppercase "#RRGGBB" ("#RRGGBBAA" when
 * the opacity is under 100%).
 */
@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
})
export class ColorPickerComponent implements OnChanges {
  @Input() color = '#000000';
  @Output() colorChange = new EventEmitter<string>();

  h = 0; // 0–360
  s = 0; // 0–1
  v = 0; // 0–1
  a = 1; // 0–1

  readonly id = `color-picker-${nextId++}`;
  readonly canEyedrop =
    typeof window !== 'undefined' && 'EyeDropper' in window;
  readonly round = Math.round;

  /** The last color we sent out; echoed back in, it must not reset h/s/v. */
  private lastEmitted: string | null = null;

  ngOnChanges(): void {
    if (this.color !== this.lastEmitted) {
      const rgba = parseCssColor(this.color);
      if (rgba) this.setRgba(rgba);
    }
  }

  get rgb(): Rgba {
    return { ...hsvToRgb(this.h, this.s, this.v), a: this.a };
  }

  /** The color without opacity: the Hex field and the thumbs. */
  get solidHex(): string {
    return toHex({ ...this.rgb, a: 1 });
  }

  get fullHex(): string {
    return toHex(this.rgb);
  }

  get hueColor(): string {
    return `hsl(${this.h} 100% 50%)`;
  }

  get alphaPercent(): number {
    return Math.round(this.a * 100);
  }

  // ---- Saturation / brightness area ----

  onAreaPointer(event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement;
    if (!this.trackPointer(event, el)) return;
    const box = el.getBoundingClientRect();
    this.s = clamp((event.clientX - box.left) / box.width);
    this.v = 1 - clamp((event.clientY - box.top) / box.height);
    this.emit();
  }

  /** Left/Right = saturation, Up/Down = brightness; Shift for bigger steps. */
  onAreaKey(event: KeyboardEvent): void {
    const step = event.shiftKey ? 0.1 : 0.01;
    const moves: Record<string, () => void> = {
      ArrowRight: () => (this.s = clamp(this.s + step)),
      ArrowLeft: () => (this.s = clamp(this.s - step)),
      ArrowUp: () => (this.v = clamp(this.v + step)),
      ArrowDown: () => (this.v = clamp(this.v - step)),
    };
    if (!moves[event.key]) return;
    event.preventDefault();
    moves[event.key]();
    this.emit();
  }

  // ---- Hue and opacity sliders ----

  onSliderPointer(event: PointerEvent, kind: SliderKind): void {
    const el = event.currentTarget as HTMLElement;
    if (!this.trackPointer(event, el)) return;
    const box = el.getBoundingClientRect();
    const fraction = clamp((event.clientX - box.left) / box.width);
    if (kind === 'hue') this.h = fraction * 360;
    else this.a = Math.round(fraction * 100) / 100;
    this.emit();
  }

  /** Arrows ±1 (Shift ±10), Page Up/Down ±10, Home/End = min/max. */
  onSliderKey(event: KeyboardEvent, kind: SliderKind): void {
    const max = kind === 'hue' ? 360 : 100;
    const now = kind === 'hue' ? Math.round(this.h) : this.alphaPercent;
    const step = event.shiftKey ? 10 : 1;
    const targets: Record<string, number> = {
      ArrowRight: now + step,
      ArrowUp: now + step,
      ArrowLeft: now - step,
      ArrowDown: now - step,
      PageUp: now + 10,
      PageDown: now - 10,
      Home: 0,
      End: max,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const value = clamp(targets[event.key], 0, max);
    if (kind === 'hue') this.h = value;
    else this.a = value / 100;
    this.emit();
  }

  // ---- Fields ----

  /** Hex accepts 3, 6 or 8 digits, with or without "#". */
  onHexChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rgba = parseHex(input.value);
    if (rgba) {
      // A 3/6-digit hex keeps the current opacity.
      this.setRgba(input.value.replace('#', '').length === 8 ? rgba : { ...rgba, a: this.a });
      this.emit();
    }
    input.value = this.solidHex; // tidy up, or undo an invalid entry
  }

  onChannelChange(event: Event, channel: Channel): void {
    const input = event.target as HTMLInputElement;
    const n = parseInt(input.value, 10);
    if (!Number.isNaN(n)) {
      this.setRgba({ ...this.rgb, [channel]: clamp(n, 0, 255) });
      this.emit();
    }
    input.value = String(this.rgb[channel]);
  }

  onAlphaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const n = parseInt(input.value, 10);
    if (!Number.isNaN(n)) {
      this.a = clamp(n, 0, 100) / 100;
      this.emit();
    }
    input.value = String(this.alphaPercent);
  }

  // ---- Eyedropper (Chrome/Edge only; the button is hidden elsewhere) ----

  async pickFromScreen(): Promise<void> {
    try {
      const dropper = new (window as any).EyeDropper();
      const { sRGBHex } = await dropper.open();
      const rgba = parseCssColor(sRGBHex);
      if (rgba) {
        this.setRgba({ ...rgba, a: this.a });
        this.emit();
      }
    } catch {
      // Esc in the eyedropper rejects; nothing to do.
    }
  }

  // ---- Helpers ----

  private setRgba(rgba: Rgba): void {
    const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    // Greys have no hue and black has no saturation: keep the old ones.
    if (hsv.s > 0 && hsv.v > 0) this.h = hsv.h;
    if (hsv.v > 0) this.s = hsv.s;
    this.v = hsv.v;
    this.a = rgba.a;
  }

  /** Starts a drag on pointerdown; true while this pointer is dragging. */
  private trackPointer(event: PointerEvent, el: HTMLElement): boolean {
    if (event.type === 'pointerdown') {
      if (event.button !== 0) return false;
      el.setPointerCapture?.(event.pointerId);
      el.focus();
      event.preventDefault(); // no text selection while dragging
      return true;
    }
    return el.hasPointerCapture?.(event.pointerId) ?? false;
  }

  private emit(): void {
    this.lastEmitted = this.fullHex;
    this.colorChange.emit(this.lastEmitted);
  }
}
