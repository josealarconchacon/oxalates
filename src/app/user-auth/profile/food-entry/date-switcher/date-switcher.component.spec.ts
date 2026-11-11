import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateSwitcherComponent } from './date-switcher.component';

describe('DateSwitcherComponent', () => {
  let component: DateSwitcherComponent;
  let fixture: ComponentFixture<DateSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateSwitcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('date pill', () => {
    const el = () => fixture.nativeElement as HTMLElement;
    const day = new Date(2026, 10, 10); // Tue, Nov 10, 2026

    beforeEach(() => {
      component.selectedDate = day;
      fixture.detectChanges();
    });

    it('groups the controls under "Change date"', () => {
      const group = el().querySelector('[role="group"]')!;
      expect(group.getAttribute('aria-label')).toBe('Change date');
      expect(
        Array.from(group.querySelectorAll('button')).map((b) =>
          b.getAttribute('aria-label')
        )
      ).toEqual([
        'Previous day',
        'Change date, currently Tuesday, November 10, 2026',
        'Next day',
      ]);
    });

    it('shows the same weekday and date text', () => {
      expect(el().querySelector('.day')!.textContent!.trim()).toBe('Tuesday');
      expect(el().querySelector('.date')!.textContent!.trim()).toBe(
        'Nov 10, 2026'
      );
    });

    it('moves one day back and forward', () => {
      const emitted: Date[] = [];
      component.dateChange.subscribe((d) => emitted.push(d));
      const [prev, , next] = Array.from(
        el().querySelectorAll('button')
      ) as HTMLButtonElement[];

      prev.click();
      next.click();

      expect(emitted.map((d) => d.getDate())).toEqual([9, 11]);
    });

    it('opens the calendar from the date button', () => {
      spyOn(component.datePicker, 'open');
      (el().querySelector('.date-button') as HTMLButtonElement).click();
      expect(component.datePicker.open).toHaveBeenCalled();
    });
  });
});

