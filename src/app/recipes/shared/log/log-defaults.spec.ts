import { defaultMeal } from './log-defaults';

describe('defaultMeal', () => {
  const at = (h: number, m = 0) => defaultMeal(new Date(2026, 10, 18, h, m));

  it('before 11:00 is Breakfast', () => {
    expect(at(0)).toBe('breakfast');
    expect(at(10, 59)).toBe('breakfast');
  });

  it('11:00–15:59 is Lunch', () => {
    expect(at(11)).toBe('lunch');
    expect(at(15, 59)).toBe('lunch');
  });

  it('from 16:00 is Dinner (never Snacks)', () => {
    expect(at(16)).toBe('dinner');
    expect(at(23, 59)).toBe('dinner');
  });
});
