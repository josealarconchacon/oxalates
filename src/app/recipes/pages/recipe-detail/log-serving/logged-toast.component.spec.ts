import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { LOGGED_TOAST_MS, LoggedToastComponent } from './logged-toast.component';

describe('LoggedToastComponent', () => {
  let fixture: ComponentFixture<LoggedToastComponent>;
  let dismiss: jasmine.Spy;
  let viewDay: jasmine.Spy;
  let undo: jasmine.Spy;
  const el = () => fixture.nativeElement as HTMLElement;
  const buttons = () => Array.from(el().querySelectorAll('button'));

  function render() {
    dismiss = jasmine.createSpy('dismiss');
    viewDay = jasmine.createSpy('viewDay');
    undo = jasmine.createSpy('undo').and.resolveTo();
    TestBed.configureTestingModule({
      imports: [LoggedToastComponent],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: { message: 'Added to Dinner on Thu, Nov 19.', viewDay, undo } },
        { provide: MatSnackBarRef, useValue: { dismiss } },
      ],
    });
    fixture = TestBed.createComponent(LoggedToastComponent);
    fixture.detectChanges();
  }

  it('shows the message with View day and Undo', fakeAsync(() => {
    render();
    expect(el().textContent).toContain('Added to Dinner on Thu, Nov 19.');
    expect(buttons().map((b) => b.textContent!.trim())).toEqual(['View day', 'Undo']);
    fixture.destroy();
  }));

  it('View day closes the toast and opens the day', fakeAsync(() => {
    render();
    buttons()[0].click();
    expect(dismiss).toHaveBeenCalled();
    expect(viewDay).toHaveBeenCalled();
    fixture.destroy();
  }));

  it('Undo waits for the removal, then closes', fakeAsync(() => {
    render();
    buttons()[1].click();
    fixture.detectChanges();
    expect(buttons()[1].textContent!.trim()).toBe('Undoing…');
    tick();
    expect(undo).toHaveBeenCalled();
    expect(dismiss).toHaveBeenCalled();
    fixture.destroy();
  }));

  it('closes by itself after ~8 s', fakeAsync(() => {
    render();
    tick(LOGGED_TOAST_MS - 1);
    expect(dismiss).not.toHaveBeenCalled();
    tick(1);
    expect(dismiss).toHaveBeenCalled();
  }));

  it('pauses while hovered or focused, then carries on', fakeAsync(() => {
    render();
    tick(5000);
    el().dispatchEvent(new Event('mouseenter'));
    tick(20000);
    expect(dismiss).not.toHaveBeenCalled();
    el().dispatchEvent(new Event('mouseleave'));
    buttons()[0].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    tick(20000);
    expect(dismiss).not.toHaveBeenCalled();
    buttons()[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    tick(2999);
    expect(dismiss).not.toHaveBeenCalled();
    tick(1);
    expect(dismiss).toHaveBeenCalled();
  }));
});
