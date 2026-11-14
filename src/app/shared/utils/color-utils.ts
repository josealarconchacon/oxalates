import { HSLA, HSVA, RGBA } from 'ngx-color';

/** The banner color before anyone picks one (light --color-hero-panel). */
export const DEFAULT_BANNER_COLOR = '#EAEFE9';

export const presetColors: string[] = [
  DEFAULT_BANNER_COLOR, // picking it goes back to the default banner
  '#17603F', // brand green
  '#4267B2',
  '#E1306C',
  '#2ECC71',
  '#E74C3C',
  '#9B59B6',
  '#F1C40F',
  '#34495E',
];

/** Screen-reader names for presetColors, in the same order. Never shown. */
export const presetColorNames: string[] = [
  'Light gray',
  'Dark green',
  'Blue',
  'Pink',
  'Green',
  'Red',
  'Purple',
  'Yellow',
  'Slate',
];

export function colorToHex(color: HSLA | HSVA | RGBA): string {
  if (!color || typeof color !== 'object') {
    return '#000000';
  }
  if ('h' in color && 's' in color && 'l' in color) {
    const { h, s, l } = color;
    const a = color.a !== undefined ? color.a : 1;
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  } else if ('h' in color && 's' in color && 'v' in color) {
    const { h, s, v } = color;
    const a = color.a !== undefined ? color.a : 1;
    return `hsva(${h}, ${s}%, ${v}%, ${a})`;
  } else if ('r' in color && 'g' in color && 'b' in color) {
    const { r, g, b } = color;
    const a = color.a !== undefined ? color.a : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return '#000000';
}

/**
 * True when white text reads better than near-black on this color, using the
 * WCAG contrast formula. Accepts any CSS color the browser understands; an
 * unknown value counts as light.
 */
export function isDarkColor(color: string): boolean {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return false;
  ctx.fillStyle = '#ffffff';
  ctx.fillStyle = color; // ignored if invalid, so it stays white
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data).map(
    (v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const onWhite = 1.05 / (luminance + 0.05);
  const onInk = (luminance + 0.05) / 0.0613; // #111a15
  return onWhite > onInk;
}
