import { LandingPageComponent } from './landing-page.component';
import { OxalateComponent } from './dialog-service/oxalate/oxalate.component';

/**
 * The live-region text is a getter on each component. Reading it off the
 * prototype with a stand-in `this` keeps these specs independent of the
 * components' many injected services.
 */
const statusOf = (component: any, property: string, self: object): string =>
  Object.getOwnPropertyDescriptor(component.prototype, property)!.get!.call(
    self
  );

describe('landing page search status (live region text)', () => {
  const status = (state: object) =>
    statusOf(LandingPageComponent, 'searchStatus', {
      searchQuery: '',
      searchResults: [],
      isLoading: false,
      ...state,
    });

  it('says it is searching while loading', () => {
    expect(status({ isLoading: true, searchQuery: 'spinach' })).toBe(
      'Searching.'
    );
  });

  it('is silent before anything has been typed', () => {
    expect(status({})).toBe('');
  });

  it('announces the result count with the right plural', () => {
    expect(status({ searchQuery: 'kiwi', searchResults: [{}] })).toBe(
      '1 result found for kiwi.'
    );
    expect(status({ searchQuery: 'kiwi', searchResults: [{}, {}, {}] })).toBe(
      '3 results found for kiwi.'
    );
  });

  it('announces when nothing matched', () => {
    expect(status({ searchQuery: 'zzz' })).toBe('No results found for zzz.');
  });
});

describe('search page results status (live region text)', () => {
  const status = (state: object) =>
    statusOf(OxalateComponent, 'resultsStatus', {
      isLoading: false,
      oxalates: [],
      showSearchPrompt: () => false,
      filterService: { getCurrentFilter: () => ({}) },
      ...state,
    });

  it('says it is loading', () => {
    expect(status({ isLoading: true })).toBe('Loading results.');
  });

  it('is silent while the page is only showing its initial suggestions', () => {
    expect(status({ showSearchPrompt: () => true })).toBe('');
  });

  it('announces the count, and the category when one is chosen', () => {
    expect(status({ oxalates: [{}, {}] })).toBe('2 results found.');
    expect(
      status({
        oxalates: [{}],
        filterService: { getCurrentFilter: () => ({ category: 'Fruits' }) },
      })
    ).toBe('1 result found in Fruits.');
  });

  it('announces when a filter leaves nothing', () => {
    expect(status({})).toBe('No results found.');
  });
});
