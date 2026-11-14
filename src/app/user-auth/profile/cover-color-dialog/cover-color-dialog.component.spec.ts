import { ComponentFixture, TestBed } from '@angular/core/testing';
import { A11yModule } from '@angular/cdk/a11y';
import { ColorSketchModule } from 'ngx-color/sketch';
import { CoverColorDialogComponent } from './cover-color-dialog.component';
import { presetColorNames } from '../../../shared/utils/color-utils';

describe('CoverColorDialogComponent', () => {
  let fixture: ComponentFixture<CoverColorDialogComponent>;
  let component: CoverColorDialogComponent;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoverColorDialogComponent],
      imports: [A11yModule, ColorSketchModule],
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
    expect(el().querySelector('.close-button')!.getAttribute('aria-label')).toBe('Close');
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
    (el().querySelector('.color-picker-title') as HTMLElement).click();
    expect(closed).not.toHaveBeenCalled();
    (el().querySelector('.color-picker-backdrop') as HTMLElement).click();
    expect(closed).toHaveBeenCalled();
  });

  it('Save sends the picked color', () => {
    const saved = jasmine.createSpy('saved');
    component.saved.subscribe(saved);
    (el().querySelector('[aria-label="Red"]') as HTMLElement).click();
    (el().querySelector('.ui-btn--primary') as HTMLElement).click();
    expect(saved).toHaveBeenCalledWith('#E74C3C');
  });
});
