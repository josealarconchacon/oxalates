import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPickerComponent } from './color-picker.component';

describe('ColorPickerComponent', () => {
  let fixture: ComponentFixture<ColorPickerComponent>;
  let picker: ColorPickerComponent;
  let emitted: string[];
  const el = () => fixture.nativeElement as HTMLElement;
  const q = <T extends HTMLElement>(s: string) => el().querySelector<T>(s)!;

  const setColor = (color: string) => {
    fixture.componentRef.setInput('color', color);
    fixture.detectChanges();
  };
  const key = (target: HTMLElement, k: string, shiftKey = false) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey }));
    fixture.detectChanges();
  };
  const type = (selector: string, value: string) => {
    const input = q<HTMLInputElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    return input;
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPickerComponent);
    picker = fixture.componentInstance;
    emitted = [];
    picker.colorChange.subscribe((c) => emitted.push(c));
    setColor('#34495E');
  });

  it('shows the color in one row of Hex, R, G, B, A fields', () => {
    const labels = [...el().querySelectorAll('.cp-field label')].map((l) => l.textContent!.trim());
    expect(labels).toEqual(['Hex', 'R', 'G', 'B', 'A']);
    expect(q<HTMLInputElement>('#' + picker.id + '-hex').value).toBe('#34495E');
    expect(q<HTMLInputElement>('#' + picker.id + '-r').value).toBe('52');
    expect(q<HTMLInputElement>('#' + picker.id + '-a').value).toBe('100');
  });

  it('labels its three sliders', () => {
    const names = [...el().querySelectorAll('[role="slider"]')].map((s) => s.getAttribute('aria-label'));
    expect(names).toEqual(['Saturation and brightness', 'Hue', 'Opacity']);
  });

  it('hue slider: arrows, Shift, Home and End', () => {
    const hue = q('.cp-hue');
    const start = Number(hue.getAttribute('aria-valuenow'));
    key(hue, 'ArrowRight');
    expect(Number(hue.getAttribute('aria-valuenow'))).toBe(start + 1);
    key(hue, 'ArrowRight', true);
    expect(Number(hue.getAttribute('aria-valuenow'))).toBe(start + 11);
    key(hue, 'Home');
    expect(hue.getAttribute('aria-valuenow')).toBe('0');
    key(hue, 'End');
    expect(hue.getAttribute('aria-valuenow')).toBe('360');
    expect(emitted.length).toBe(4);
  });

  it('opacity slider: below 100% the color gains an alpha byte', () => {
    const alpha = q('.cp-alpha');
    key(alpha, 'PageDown'); // 100 → 90
    expect(alpha.getAttribute('aria-valuetext')).toBe('90%');
    expect(emitted.at(-1)).toBe('#34495EE6');
  });

  it('area: Left/Right change saturation, Up/Down brightness', () => {
    const area = q('.cp-area');
    key(area, 'ArrowDown', true);
    expect(area.getAttribute('aria-valuetext')).toContain('brightness 27%');
    key(area, 'ArrowLeft', true);
    expect(area.getAttribute('aria-valuetext')).toContain('Saturation 35%');
  });

  it('keys it does not handle are left alone (Tab still moves on)', () => {
    key(q('.cp-hue'), 'Tab');
    expect(emitted.length).toBe(0);
  });

  it('typing a hex applies it and keeps the opacity', () => {
    picker.a = 0.5;
    type('#' + picker.id + '-hex', 'e74c3c');
    expect(emitted.at(-1)).toBe('#E74C3C80');
  });

  it('an invalid hex or number is undone', () => {
    expect(type('#' + picker.id + '-hex', 'zzz').value).toBe('#34495E');
    expect(type('#' + picker.id + '-g', 'abc').value).toBe('73');
    expect(emitted.length).toBe(0);
  });

  it('R/G/B and A are clamped to their ranges', () => {
    expect(type('#' + picker.id + '-r', '300').value).toBe('255');
    expect(type('#' + picker.id + '-a', '150').value).toBe('100');
  });

  it('a color coming back in from the parent does not reset the hue', () => {
    const hue = q('.cp-hue');
    key(hue, 'Home'); // hue 0
    key(q('.cp-area'), 'ArrowDown', true);
    // Drag to black: hue would be lost if the echo were re-parsed.
    for (let i = 0; i < 4; i++) key(q('.cp-area'), 'ArrowDown', true);
    setColor(emitted.at(-1)!);
    expect(hue.getAttribute('aria-valuenow')).toBe('0');
  });

  it('a new color from outside (a preset) updates everything', () => {
    setColor('#E1306C');
    expect(q<HTMLInputElement>('#' + picker.id + '-hex').value).toBe('#E1306C');
    expect(emitted.length).toBe(0); // no echo back out
  });

  it('only offers the eyedropper when the browser has one', () => {
    const has = 'EyeDropper' in window;
    expect(!!el().querySelector('[aria-label="Pick color from screen"]')).toBe(has);
  });
});
