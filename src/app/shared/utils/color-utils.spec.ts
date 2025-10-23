import { colorToHex, presetColors } from './color-utils'; // Adjust path as needed

fdescribe('Color Utility Functions', () => {
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

  describe('colorToHex', () => {
    describe('HSLA input', () => {
      it('should convert HSLA object to hsla string with specified alpha', () => {
        const result = colorToHex(mockHSLA);
        expect(result).toBe('hsla(120, 50%, 75%, 0.5)');
      });

      it('should convert HSLA object to hsla string with default alpha when alpha is undefined', () => {
        const result = colorToHex(mockHSLA_noAlpha as any);
        expect(result).toBe('hsla(120, 50%, 75%, 1)');
      });
    });

    describe('HSVA input', () => {
      it('should convert HSVA object to hsva string with specified alpha', () => {
        const result = colorToHex(mockHSVA);
        expect(result).toBe('hsva(60, 100%, 100%, 0.8)');
      });

      it('should convert HSVA object to hsva string with default alpha when alpha is undefined', () => {
        const result = colorToHex(mockHSVA_noAlpha as any);
        expect(result).toBe('hsva(60, 100%, 100%, 1)');
      });
    });

    describe('RGBA input', () => {
      it('should convert RGBA object to rgba string with specified alpha', () => {
        const result = colorToHex(mockRGBA);
        expect(result).toBe('rgba(255, 0, 0, 0.3)');
      });

      it('should convert RGBA object to rgba string with default alpha when alpha is undefined', () => {
        const result = colorToHex(mockRGBA_noAlpha as any);
        expect(result).toBe('rgba(255, 0, 0, 1)');
      });
    });

    describe('Invalid input', () => {
      it('should return #000000 for null input', () => {
        const result = colorToHex(null as any);
        expect(result).toBe('#000000');
      });

      it('should return #000000 for undefined input', () => {
        const result = colorToHex(undefined as any);
        expect(result).toBe('#000000');
      });

      it('should return #000000 for incomplete object missing required properties', () => {
        const incompleteHSLA = { h: 120, s: 50 }; // Missing l
        const result = colorToHex(incompleteHSLA as any);
        expect(result).toBe('#000000');
      });

      it('should return #000000 for object with none of the expected color properties', () => {
        const randomObj = { x: 1, y: 2 };
        const result = colorToHex(randomObj as any);
        expect(result).toBe('#000000');
      });
    });
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

const mockHSLA = { h: 120, s: 50, l: 75, a: 0.5 };
const mockHSLA_noAlpha = { h: 120, s: 50, l: 75 };
const mockHSVA = { h: 60, s: 100, v: 100, a: 0.8 };
const mockHSVA_noAlpha = { h: 60, s: 100, v: 100 };
const mockRGBA = { r: 255, g: 0, b: 0, a: 0.3 };
const mockRGBA_noAlpha = { r: 255, g: 0, b: 0 };
