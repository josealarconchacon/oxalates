import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlertComponent]
    });
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('look and behaviour', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    beforeEach(() => {
      component.message = 'Food can not be logged as serving size is not available.';
      fixture.detectChanges();
    });

    it('is announced to screen readers with the same message', () => {
      const box = el().querySelector('[role="alert"]')!;
      expect(box.textContent!.trim()).toBe(
        'Food can not be logged as serving size is not available.'
      );
    });

    it('has a labelled close button that hides it', () => {
      const close = el().querySelector('.close-alert-btn') as HTMLButtonElement;
      expect(close.getAttribute('aria-label')).toBe('Close');
      expect(close.getAttribute('type')).toBe('button');
      close.click();
      fixture.detectChanges();
      expect(el().querySelector('[role="alert"]')).toBeNull();
    });
  });
});

