import { hsvToRgb, parseCssColor, parseHex, rgbToHsv, toHex } from './color-math';

describe('color math', () => {
  it('parses 3, 6 and 8 digit hex, with or without #', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseHex('34495E')).toEqual({ r: 52, g: 73, b: 94, a: 1 });
    expect(parseHex('#34495E80')).toEqual({ r: 52, g: 73, b: 94, a: 0.5 });
  });

  it('rejects anything that is not hex', () => {
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('blue')).toBeNull();
    expect(parseHex('')).toBeNull();
  });

  it('writes #RRGGBB, and #RRGGBBAA only below full opacity', () => {
    expect(toHex({ r: 52, g: 73, b: 94, a: 1 })).toBe('#34495E');
    expect(toHex({ r: 52, g: 73, b: 94, a: 0.5 })).toBe('#34495E80');
  });

  it('round-trips whole-percent opacity through hex', () => {
    for (const pct of [0, 1, 33, 50, 99]) {
      const hex = toHex({ r: 0, g: 0, b: 0, a: pct / 100 });
      expect(parseHex(hex)!.a).toBe(pct / 100);
    }
  });

  it('converts RGB ⇄ HSV', () => {
    expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 1, v: 1 });
    expect(hsvToRgb(240, 1, 1)).toEqual({ r: 0, g: 0, b: 255 });
    const { h, s, v } = rgbToHsv(52, 73, 94);
    expect(hsvToRgb(h, s, v)).toEqual({ r: 52, g: 73, b: 94 });
  });

  it('reads older non-hex saves like rgba()', () => {
    expect(parseCssColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    expect(parseCssColor('not a color')).toBeNull();
  });
});
