import { LEVEL_NUMBERS, LevelRange, levelForMgPerServing } from './recipe-level';
import { formatMg, formatShare } from './format';

// Example ranges for the test only; the real ones aren't decided yet.
const ranges: LevelRange[] = [
  { level: 'High', below: Infinity },
  { level: 'Low', below: 5 },
  { level: 'Medium', below: 10 },
];

describe('levelForMgPerServing', () => {
  it('uses the ranges fitted to the food list by default (per serving)', () => {
    const cases: [number, string][] = [
      [0, 'Very Low'],
      [0.99, 'Very Low'],
      [1, 'Low'],
      [4.99, 'Low'],
      [5, 'Medium'],
      [14.99, 'Medium'],
      [15, 'High'],
      [19.99, 'High'],
      [20, 'Very High'],
      [39.99, 'Very High'],
      [40, 'Extremely High'],
      [5996, 'Extremely High'],
    ];
    for (const [mg, level] of cases) {
      expect(levelForMgPerServing(mg)).withContext(`${mg} mg`).toBe(level);
    }
  });

  it('every level has the same number as in the food list', () => {
    expect(LEVEL_NUMBERS).toEqual({
      'Very Low': '1',
      Low: '2',
      Medium: '3',
      High: '4',
      'Very High': '5',
      'Extremely High': '6',
      uncalculated: '7',
    });
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
