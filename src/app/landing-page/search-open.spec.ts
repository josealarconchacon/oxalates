import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent when the results open', () => {
  const proto = LandingPageComponent.prototype as any;

  const stand = (state: object = {}) => {
    const self: any = {
      searchQuery: '',
      showSearchResults: false,
      searchResults: [],
      isLoading: false,
      lastQuery: '',
      pendingFocus: false,
      openedBySubmit: false,
      MIN_AUTO_SEARCH_LENGTH: 3,
      searchSubject: { next: jasmine.createSpy('next') },
      setSearchResultsVisible: (visible: boolean) =>
        proto.setSearchResultsVisible.call(self, visible),
      ...state,
    };
    return self;
  };

  const type = (self: any, query: string) =>
    proto.onSearchQueryChange.call(self, query);
  const submit = (self: any) => proto.onSearchSubmitted.call(self);

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('stays closed below 3 characters', () => {
    const self = stand();

    type(self, 'ka');

    expect(self.showSearchResults).toBeFalse();
  });

  it('opens by itself at 3 characters and moves focus to the results search', () => {
    const self = stand();

    type(self, 'kal');

    expect(self.showSearchResults).toBeTrue();
    expect(self.pendingFocus).toBeTrue();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('does not count surrounding spaces towards the 3 characters', () => {
    const self = stand();

    type(self, ' k ');

    expect(self.showSearchResults).toBeFalse();
  });

  it('closes again when typing back below 3 characters', () => {
    const self = stand();
    type(self, 'kale');

    type(self, 'ka');

    expect(self.showSearchResults).toBeFalse();
  });

  it('opens on Enter / Search for a short query, and starts the search', () => {
    const self = stand({ searchQuery: 'ka' });
    type(self, 'ka');

    submit(self);

    expect(self.showSearchResults).toBeTrue();
    expect(self.pendingFocus).toBeTrue();
    expect(self.searchSubject.next).toHaveBeenCalledWith('ka');
  });

  it('keeps a submit-opened panel open while the query stays short', () => {
    const self = stand({ searchQuery: 'ka' });
    submit(self);

    type(self, 'k');

    expect(self.showSearchResults).toBeTrue();
  });

  it('closes a submit-opened panel once the query is emptied', () => {
    const self = stand({ searchQuery: 'ka' });
    submit(self);

    type(self, '');

    expect(self.showSearchResults).toBeFalse();
  });

  it('forgets it was opened by submit once closed, so typing closes it normally', () => {
    const self = stand({ searchQuery: 'ka' });
    submit(self);
    proto.setSearchResultsVisible.call(self, false);

    type(self, 'k');

    expect(self.showSearchResults).toBeFalse();
    expect(self.openedBySubmit).toBeFalse();
  });

  it('ignores Enter / Search when there is nothing to search for', () => {
    const self = stand({ searchQuery: '   ' });

    submit(self);

    expect(self.showSearchResults).toBeFalse();
  });

  it('leaves an already open panel alone on Enter / Search', () => {
    const self = stand({ searchQuery: 'kale', showSearchResults: true });

    submit(self);

    expect(self.pendingFocus).toBeFalse();
    expect(self.openedBySubmit).toBeFalse();
  });
});
