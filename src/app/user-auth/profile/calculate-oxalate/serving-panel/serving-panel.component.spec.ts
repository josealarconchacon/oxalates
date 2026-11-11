import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServingPanelComponent } from './serving-panel.component';

describe('ServingPanelComponent', () => {
  let component: ServingPanelComponent;
  let fixture: ComponentFixture<ServingPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServingPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServingPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const cells = () =>
    Array.from(el().querySelectorAll('.summary-cell')).map((c) => [
      c.querySelector('dt')!.textContent!.trim(),
      c.querySelector('dd')!.textContent!.trim(),
    ]);

  it('shows the three values as one read-only list with the same labels', () => {
    expect(el().querySelectorAll('input[readonly]').length).toBe(0);
    expect(cells()).toEqual([
      ['Serving Size', '0'],
      ['Total Oxalate Per Serving', '0'],
      ['Total Soluble Oxalate Per Serving', '0'],
    ]);
  });

  it('shows the picked food values as they come', () => {
    component.servingSize = '1 tsp';
    component.totalOxalatePerServing = '0.11' as any;
    component.totalSolubleOxalatePerServing = 0;
    fixture.detectChanges();
    expect(cells().map((c) => c[1])).toEqual(['1 tsp', '0.11', '0']);
    expect(el().querySelector('.summary-strip')!.classList).not.toContain(
      'is-empty'
    );
  });

  it('announces value changes politely', () => {
    expect(
      el().querySelector('.summary-strip')!.getAttribute('aria-live')
    ).toBe('polite');
  });

  it('has no decorative scale icons', () => {
    expect(el().querySelector('.material-icons')).toBeNull();
  });

  it('keeps Number of Servings as a typed field', () => {
    const emitted: string[] = [];
    component.numberOfServingsChange.subscribe((v) => emitted.push(v));
    const input = el().querySelector('#number-of-servings') as HTMLInputElement;
    expect(el().querySelector('label[for="number-of-servings"]')!.textContent!.trim()).toBe(
      'Number of Servings'
    );
    input.value = '2.5';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toEqual(['2.5']);
  });

  describe('servings stepper', () => {
    const emitted: string[] = [];
    const buttons = () =>
      Array.from(el().querySelectorAll('.step-button')) as HTMLButtonElement[];

    beforeEach(() => {
      emitted.length = 0;
      component.numberOfServingsChange.subscribe((v) => emitted.push(v));
    });

    it('labels the buttons for screen readers', () => {
      expect(buttons().map((b) => b.getAttribute('aria-label'))).toEqual([
        'Decrease servings',
        'Increase servings',
      ]);
    });

    it('adds one serving', () => {
      component.numberOfServings = '2';
      fixture.detectChanges();
      buttons()[1].click();
      expect(emitted).toEqual(['3']);
    });

    it('removes one serving, keeping decimals', () => {
      component.numberOfServings = '2.5';
      fixture.detectChanges();
      buttons()[0].click();
      expect(emitted).toEqual(['1.5']);
    });

    it('cannot go below 1 with the buttons', () => {
      component.numberOfServings = '1';
      fixture.detectChanges();
      expect(buttons()[0].disabled).toBeTrue();
      expect(buttons()[1].disabled).toBeFalse();
    });
  });
});

