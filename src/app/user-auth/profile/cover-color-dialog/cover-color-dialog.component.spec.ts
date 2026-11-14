import { ComponentFixture, TestBed } from '@angular/core/testing';
import { A11yModule } from '@angular/cdk/a11y';
import { ColorSketchModule } from 'ngx-color/sketch';
import { CoverColorDialogComponent } from './cover-color-dialog.component';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { presetColorNames } from '../../../shared/utils/color-utils';

describe('CoverColorDialogComponent', () => {
  let fixture: ComponentFixture<CoverColorDialogComponent>;
  let component: CoverColorDialogComponent;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoverColorDialogComponent],
      imports: [A11yModule, ColorSketchModule, IconComponent],
    });
    fixture = TestBed.createComponent(CoverColorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is a modal dialog named by its "Choose Color" title', () => {
    const dialog = el().querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title = el().querySelector('#' + dialog.getAttribute('aria-labelledby'))!;
    expect(title.textContent!.trim()).toBe('Choose Color');
  });

  it('labels the close button "Close"', () => {
    expect(el().querySelector('.cc-close')!.getAttribute('aria-label')).toBe('Close');
  });

  it('names every preset swatch, in order', () => {
    const names = [...el().querySelectorAll('.color-preset')].map((b) =>
      b.getAttribute('aria-label')
    );
    expect(names).toEqual(presetColorNames);
    expect(names.length).toBe(9);
  });

  it('starts on the default color when nothing is saved', () => {
    const first = el().querySelector('.color-preset')!;
    expect(first.getAttribute('aria-selected')).toBe('true');
  });

  it('Esc cancels without saving', () => {
    const closed = jasmine.createSpy('closed');
    const saved = jasmine.createSpy('saved');
    component.closed.subscribe(closed);
    component.saved.subscribe(saved);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toHaveBeenCalled();
    expect(saved).not.toHaveBeenCalled();
  });

  it('a click inside the dialog does not close it; the backdrop does', () => {
    const closed = jasmine.createSpy('closed');
    component.closed.subscribe(closed);
    (el().querySelector('.cc-title') as HTMLElement).click();
    expect(closed).not.toHaveBeenCalled();
    (el().querySelector('.cc-backdrop') as HTMLElement).click();
    expect(closed).toHaveBeenCalled();
  });

  it('Save sends the picked color', () => {
    const saved = jasmine.createSpy('saved');
    component.saved.subscribe(saved);
    (el().querySelector('[aria-label="Red"]') as HTMLElement).click();
    (el().querySelector('.cc-btn--save') as HTMLElement).click();
    expect(saved).toHaveBeenCalledWith('#E74C3C');
  });

  it('keeps the header and footer outside the scrolling body', () => {
    const dialog = el().querySelector('[role="dialog"]')!;
    const parts = [...dialog.children].map((c) => c.className);
    expect(parts).toEqual(['cc-header', 'cc-body', 'cc-footer']);
    const buttons = [...el().querySelectorAll('.cc-footer button')].map((b) =>
      b.textContent!.trim()
    );
    expect(buttons).toEqual(['Cancel', 'Save']);
  });

  describe('preview card', () => {
    const cover = () => el().querySelector('.cc-preview-cover') as HTMLElement;

    it('is hidden from screen readers and shows the name and photo', () => {
      component.name = 'Ana Ruiz';
      component.avatarUrl = 'https://example.com/me.png';
      fixture.detectChanges();
      expect(el().querySelector('.cc-preview')!.getAttribute('aria-hidden')).toBe('true');
      expect(el().querySelector('.cc-preview-name')!.textContent!.trim()).toBe('Ana Ruiz');
      expect(el().querySelector('.cc-preview-avatar')!.getAttribute('src')).toBe(
        'https://example.com/me.png'
      );
    });

    it('falls back to the default avatar when there is no photo', () => {
      expect(el().querySelector('.cc-preview-avatar')!.getAttribute('src')).toBe(
        'assets/images/default-avatar.svg'
      );
    });

    it('repaints the cover as you pick, and uses the theme cover for the default', () => {
      expect(cover().style.backgroundColor).toBe(''); // default: the CSS theme cover
      (el().querySelector('[aria-label="Blue"]') as HTMLElement).click();
      fixture.detectChanges();
      expect(cover().style.backgroundColor).toBe('rgb(66, 103, 178)');
    });
  });
});
