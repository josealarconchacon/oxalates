import { SORT_OPTIONS, countLine, isSortKey } from './list-query';

describe('list query: sort options and count', () => {
  it('Lowest oxalate first is the default (first) option', () => {
    expect(SORT_OPTIONS[0].label).toBe('Lowest oxalate first');
  });

  it('count line', () => {
    expect(countLine(0, 'name')).toBe('0 recipes · sorted by name');
    expect(countLine(1, 'lowest')).toBe('1 recipe · sorted by oxalate per serving');
    expect(countLine(12, 'highest')).toBe('12 recipes · sorted by oxalate per serving');
    expect(countLine(3, 'edited')).toBe('3 recipes · sorted by last edited');
  });

  it('only known sort keys are accepted', () => {
    expect(isSortKey('name')).toBeTrue();
    expect(isSortKey('random')).toBeFalse();
  });
});
