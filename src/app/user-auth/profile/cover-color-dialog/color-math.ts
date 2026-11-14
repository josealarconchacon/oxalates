/** Color conversions for the cover color picker. a (alpha) is 0–1 everywhere. */

export interface Rgba {
  r: number; // 0–255
  g: number;
  b: number;
  a: number; // 0–1
}

export interface Hsv {
  h: number; // 0–360
  s: number; // 0–1
  v: number; // 0–1
}

export const clamp = (n: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, n));

/** "#abc", "abc", "#aabbcc", "#aabbccdd" → Rgba; anything else → null. */
export function parseHex(input: string): Rgba | null {
  const m = input.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(m)) {
    return null;
  }
  const full = m.length <= 4 ? [...m].map((c) => c + c).join('') : m;
  const byte = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return {
    r: byte(0),
    g: byte(2),
    b: byte(4),
    // Two decimals = whole percents, which is what the A field shows.
    a: full.length === 8 ? Math.round((byte(6) / 255) * 100) / 100 : 1,
  };
}

/**
 * Any CSS color (hex, rgb(), named…) → Rgba, by letting the browser
 * normalize it. Used for colors saved before the picker spoke only hex.
 */
export function parseCssColor(input: string): Rgba | null {
  const hex = parseHex(input);
  if (hex) return hex;
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#010203';
  ctx.fillStyle = input; // ignored if invalid
  const normalized = String(ctx.fillStyle);
  if (normalized === '#010203') return null;
  const asHex = parseHex(normalized);
  if (asHex) return asHex;
  const m = normalized.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  return m
    ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] }
    : null;
}

/** Uppercase "#RRGGBB", or "#RRGGBBAA" when not fully opaque. */
export function toHex({ r, g, b, a }: Rgba): string {
  const two = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  const alpha = a < 1 ? two(a * 255) : '';
  return `#${two(r)}${two(g)}${two(b)}${alpha}`.toUpperCase();
}

export function rgbToHsv(r: number, g: number, b: number): Hsv {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const d = max - Math.min(rr, gg, bb);
  let h = 0;
  if (d) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

export function hsvToRgb(h: number, s: number, v: number): Omit<Rgba, 'a'> {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))));
  };
  return { r: f(5), g: f(3), b: f(1) };
}
