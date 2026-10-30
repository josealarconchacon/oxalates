import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';
import { routes } from '../../app-routing.module';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;
  const el = (selector: string) =>
    fixture.nativeElement.querySelector(selector) as HTMLElement | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
  });

  it('says plainly that the page does not exist, in the page heading', () => {
    expect(el('h1')!.textContent).toContain('Page not found');
  });

  it('offers a way back to the home page and to the food search', () => {
    const hrefs = Array.from(
      fixture.nativeElement.querySelectorAll('a.not-found-link')
    ).map((a) => (a as HTMLAnchorElement).getAttribute('href'));

    expect(hrefs).toEqual(['/', '/oxalate']);
  });

  describe('routing', () => {
    it('is what an unknown URL resolves to, not a redirect to sign-in', () => {
      const wildcard = routes.find((r) => r.path === '**')!;

      expect(wildcard.component).toBe(NotFoundComponent);
      expect(wildcard.redirectTo).toBeUndefined();
      expect(wildcard.title).toBe('Page not found');
    });

    it('has no unreachable second route for the empty path', () => {
      expect(routes.filter((r) => r.path === '').length).toBe(1);
    });
  });
});
