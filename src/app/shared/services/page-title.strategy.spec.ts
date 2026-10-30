import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { PageTitleStrategy } from './page-title.strategy';

describe('PageTitleStrategy', () => {
  let strategy: PageTitleStrategy;
  let title: jasmine.SpyObj<Title>;

  const snapshot = {} as RouterStateSnapshot;

  beforeEach(() => {
    title = jasmine.createSpyObj('Title', ['setTitle']);
    TestBed.configureTestingModule({
      providers: [
        { provide: Title, useValue: title },
        { provide: TitleStrategy, useClass: PageTitleStrategy },
      ],
    });
    strategy = TestBed.inject(TitleStrategy) as PageTitleStrategy;
  });

  it('puts the page title before the site name', () => {
    spyOn(strategy, 'buildTitle').and.returnValue('Search foods by oxalate level');

    strategy.updateTitle(snapshot);

    expect(title.setTitle).toHaveBeenCalledWith(
      'Search foods by oxalate level – Oxalate Info'
    );
  });

  it('falls back to the site name when a route has no title', () => {
    spyOn(strategy, 'buildTitle').and.returnValue(undefined);

    strategy.updateTitle(snapshot);

    expect(title.setTitle).toHaveBeenCalledWith('Oxalate Info');
  });

  it('is the strategy the router resolves', () => {
    expect(TestBed.inject(TitleStrategy)).toBeInstanceOf(PageTitleStrategy);
  });
});
