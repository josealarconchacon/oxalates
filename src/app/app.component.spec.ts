import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: '<div>Mock App Header</div>',
  standalone: false,
})
class MockAppHeaderComponent {}

@Component({
  selector: 'app-auth-message',
  template: '',
  standalone: false,
})
class MockAuthMessageComponent {}

@Component({
  selector: 'app-footer',
  template: '<footer>Mock App Footer</footer>',
  standalone: false,
})
class MockAppFooterComponent {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterOutlet],
      declarations: [
        AppComponent,
        MockAppHeaderComponent,
        MockAuthMessageComponent,
        MockAppFooterComponent,
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render app-header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });

  it('should have as title "oxalates"', () => {
    expect(component.title).toEqual('oxalates');
  });

  describe('page landmarks', () => {
    const el = (selector: string) =>
      (fixture.nativeElement as HTMLElement).querySelector(
        selector
      ) as HTMLElement | null;

    it('wraps the routed page in a single main landmark', () => {
      const mains = (fixture.nativeElement as HTMLElement).querySelectorAll(
        'main'
      );
      expect(mains.length).toBe(1);
      expect(mains[0].id).toBe('main');
      expect(mains[0].querySelector('router-outlet')).toBeTruthy();
    });

    it('puts a skip link to the main landmark before the header', () => {
      const root = fixture.nativeElement as HTMLElement;
      const link = el('a.skip-link')!;

      expect(link.getAttribute('href')).toBe('#main');
      expect(link.textContent).toContain('Skip to main content');
      expect(
        link.compareDocumentPosition(root.querySelector('app-header')!) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('moves focus to main when the skip link is used, without navigating', () => {
      const link = el('a.skip-link')!;
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });

      link.dispatchEvent(event);

      expect(event.defaultPrevented).toBeTrue();
      expect(document.activeElement).toBe(el('main'));
    });
  });

  it('renders the footer once, after <main> and outside it', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footers = compiled.querySelectorAll('app-footer');
    const main = compiled.querySelector('main')!;

    expect(footers.length).toBe(1);
    expect(main.contains(footers[0])).toBeFalse();
    expect(
      main.compareDocumentPosition(footers[0]) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
