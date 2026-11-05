import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../app-routing.module';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';

/**
 * Google's OAuth consent screen links to /privacy and /terms, and verification
 * fails if either link is broken, so the routes are checked here too.
 */
describe('Legal pages', () => {
  const routeFor = (path: string) => routes.find((r) => r.path === path);

  it('has /privacy and /terms routes that load the right pages', async () => {
    expect(routeFor('privacy')?.title).toBe('Privacy Policy');
    expect(routeFor('terms')?.title).toBe('Terms of Use');
    expect(await routeFor('privacy')!.loadComponent!()).toBe(PrivacyComponent);
    expect(await routeFor('terms')!.loadComponent!()).toBe(TermsComponent);
  });

  function render(component: any): HTMLElement {
    TestBed.configureTestingModule({
      imports: [component],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('privacy policy explains Google sign-in and how to delete data', () => {
    const el = render(PrivacyComponent);
    const text = el.textContent!;

    expect(el.querySelector('h1')!.textContent).toBe('Privacy Policy');
    expect(text).toContain('Google API Services User Data Policy');
    expect(text).toContain('Limited Use');
    expect(text).toContain('delete your account');
  });

  it('terms of use say the site is not medical advice', () => {
    const el = render(TermsComponent);

    expect(el.querySelector('h1')!.textContent).toBe('Terms of Use');
    expect(el.textContent).toContain('not medical advice');
  });
});
