import { HSLA, HSVA, RGBA } from 'ngx-color';

export const presetColors: string[] = [
  '#1da1f2',
  '#4267B2',
  '#E1306C',
  '#2ECC71',
  '#E74C3C',
  '#9B59B6',
  '#F1C40F',
  '#34495E',
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
