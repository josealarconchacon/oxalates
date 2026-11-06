import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthMessageService } from '../../services/auth-message.service';
import { AuthMessageComponent } from './auth-message.component';

describe('AuthMessageComponent', () => {
  let fixture: ComponentFixture<AuthMessageComponent>;
  let service: AuthMessageService;
  let router: jasmine.SpyObj<Router>;

  const el = <T extends HTMLElement = HTMLElement>(selector: string) =>
    fixture.nativeElement.querySelector(selector) as T | null;
  const buttonByText = (text: string) =>
    Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button')
    ).find((b) => b.textContent!.trim() === text)!;

  function open(): void {
    service.showAuthMessage();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [AuthMessageComponent],
      providers: [{ provide: Router, useValue: router }],
    }).compileComponents();

    service = TestBed.inject(AuthMessageService);
    fixture = TestBed.createComponent(AuthMessageComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    service.dismiss();
    fixture.detectChanges();
  });

  it('renders nothing until it is opened', () => {
    expect(el('[role="dialog"]')).toBeNull();
  });

  describe('when open', () => {
    beforeEach(() => open());

    it('is a labelled modal dialog', () => {
      const dialog = el('[role="dialog"]')!;
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      const title = el('#' + dialog.getAttribute('aria-labelledby'))!;
      expect(title.textContent).toContain('Track your daily oxalate intake');
      expect(el('#' + dialog.getAttribute('aria-describedby'))).not.toBeNull();
    });

    it('lists what an account gives you', () => {
      const items = Array.from(
        fixture.nativeElement.querySelectorAll('.auth-prompt-benefit strong')
      ).map((s: any) => s.textContent.trim());
      expect(items).toEqual(['A daily food log', 'Saved foods', 'Reports']);
    });

    it('puts focus on the sign-in button', () => {
      expect(document.activeElement).toBe(
        buttonByText('Sign in or create account')
      );
    });

    it('"Sign in or create account" opens the sign-in page', () => {
      buttonByText('Sign in or create account').click();
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledOnceWith(['/auth']);
      expect(el('[role="dialog"]')).toBeNull();
    });

    for (const [how, close] of [
      ['"Not now"', () => buttonByText('Not now').click()],
      ['the close button', () => el<HTMLButtonElement>('.auth-prompt-close')!.click()],
      ['Escape', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))],
      ['a click on the backdrop', () => el('.auth-prompt-backdrop')!.click()],
    ] as const) {
      it(`${how} closes it without leaving the page`, () => {
        close();
        fixture.detectChanges();

        expect(el('[role="dialog"]')).toBeNull();
        expect(router.navigate).not.toHaveBeenCalled();
      });
    }

    it('a click inside the box does not close it', () => {
      el('.auth-prompt-title')!.click();
      fixture.detectChanges();

      expect(el('[role="dialog"]')).not.toBeNull();
    });
  });
});
