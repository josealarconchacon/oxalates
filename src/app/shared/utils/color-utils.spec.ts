import { isDarkColor, presetColorNames, presetColors } from './color-utils';

describe('Color Utility Functions', () => {
  describe('presetColors', () => {
    it('should be defined and contain valid hex color strings', () => {
      expect(mockPresetColors).toBeDefined();
      expect(Array.isArray(mockPresetColors)).toBe(true);
      expect(mockPresetColors.length).toBeGreaterThan(0);
      mockPresetColors.forEach((color) => {
        expect(typeof color).toBe('string');
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  it('has a screen-reader name for every preset', () => {
    expect(presetColorNames.length).toBe(presetColors.length);
  });
});

// Mock Data
const mockPresetColors = [
  '#1da1f2',
  '#4267B2',
  '#E1306C',
  '#2ECC71',
  '#E74C3C',
  '#9B59B6',
  '#F1C40F',
  '#34495E',
];

describe('isDarkColor', () => {
  it('treats dark banners as dark', () => {
    expect(isDarkColor('#17603F')).toBeTrue();
    expect(isDarkColor('#34495E')).toBeTrue();
    expect(isDarkColor('rgba(0, 0, 0, 1)')).toBeTrue();
  });

  it('treats light banners as light', () => {
    expect(isDarkColor('#eaefe9')).toBeFalse();
    expect(isDarkColor('#F1C40F')).toBeFalse();
    expect(isDarkColor('#2ECC71')).toBeFalse();
  });

  it('treats an unknown value as light', () => {
    expect(isDarkColor('not-a-color')).toBeFalse();
  });
});

