import { LevelRange, RECIPE_LEVEL_RANGES, levelForMgPerServing } from './recipe-level';
import { formatMg, formatShare } from './format';

// Example ranges for the test only; the real ones aren't decided yet.
const ranges: LevelRange[] = [
  { level: 'High', below: Infinity },
  { level: 'Low', below: 5 },
  { level: 'Medium', below: 10 },
];

describe('levelForMgPerServing', () => {
  it('has no ranges yet, so no level', () => {
    expect(RECIPE_LEVEL_RANGES).toBeNull();
    expect(levelForMgPerServing(3)).toBeNull();
  });

  it('picks the first range the value is below (ranges in any order)', () => {
    expect(levelForMgPerServing(0, ranges)).toBe('Low');
    expect(levelForMgPerServing(4.99, ranges)).toBe('Low');
    expect(levelForMgPerServing(5, ranges)).toBe('Medium');
    expect(levelForMgPerServing(250, ranges)).toBe('High');
  });

  it('ignores bad input', () => {
    expect(levelForMgPerServing(NaN, ranges)).toBeNull();
    expect(levelForMgPerServing(-1, ranges)).toBeNull();
  });
});

describe('display formatting', () => {
  it('mg to 1 decimal, shares as whole percents', () => {
    expect(formatMg(12.345)).toBe('12.3');
    expect(formatMg(0)).toBe('0.0');
    expect(formatShare(33.4)).toBe('33%');
    expect(formatShare(66.6)).toBe('67%');
  });
});
