import { OxalateComponent } from './oxalate.component';

/**
 * What /oxalate shows before anyone searches or filters. It used to be a random
 * page of the dataset on every visit, with a pager that said "page 1" regardless.
 * The method is called on a stand-in `this` so the spec does not need the
 * component's many injected services.
 */
describe('OxalateComponent default view (loadFirstPage)', () => {
  const PAGE_SIZE = 12;
  const food = (n: number) => ({ id: n, item: `Food ${n}` });
  const dataset = Array.from({ length: 100 }, (_, i) => food(i + 1));

  let changePage: jasmine.Spy;

  const stand = (state: object = {}) => {
    changePage = jasmine.createSpy('changePage');
    return {
      originalOxalates: dataset,
      oxalates: dataset,
      browseItems: [] as unknown[],
      fullDatasetLength: 0,
      paginationService: { itemsPerPage: PAGE_SIZE, changePage },
      ...state,
    } as any;
  };

  const loadFirstPage = (self: object) =>
    OxalateComponent.prototype.loadFirstPage.call(self);

  it('shows the first page of the dataset, in the dataset order', () => {
    const self = stand();

    loadFirstPage(self);

    expect(self.browseItems.length).toBe(PAGE_SIZE);
    expect(self.browseItems[0]).toEqual(food(1));
    expect(self.browseItems[PAGE_SIZE - 1]).toEqual(food(PAGE_SIZE));
  });

  it('is the same every time it is loaded', () => {
    const first = stand();
    const second = stand();
    // A random start would make these differ (and would call Math.random).
    const random = spyOn(Math, 'random').and.returnValue(0.9);

    loadFirstPage(first);
    loadFirstPage(second);

    expect(second.browseItems).toEqual(first.browseItems);
    expect(random).not.toHaveBeenCalled();
  });

  it('tells the pager it is on page 1, so the list and the pager agree', () => {
    const self = stand();

    loadFirstPage(self);

    expect(changePage).toHaveBeenCalledOnceWith(1, dataset.length);
    expect(self.fullDatasetLength).toBe(dataset.length);
  });

  it('falls back to the loaded results when the original list is empty', () => {
    const self = stand({ originalOxalates: [], oxalates: dataset.slice(0, 30) });

    loadFirstPage(self);

    expect(self.browseItems.length).toBe(PAGE_SIZE);
    expect(changePage).toHaveBeenCalledOnceWith(1, 30);
  });

  it('shows nothing, and leaves the pager alone, before any data has loaded', () => {
    const self = stand({ originalOxalates: [], oxalates: [] });

    loadFirstPage(self);

    expect(self.browseItems).toEqual([]);
    expect(changePage).not.toHaveBeenCalled();
  });

  it('shows a short dataset on one page', () => {
    const self = stand({ originalOxalates: dataset.slice(0, 5) });

    loadFirstPage(self);

    expect(self.browseItems.length).toBe(5);
  });
});
