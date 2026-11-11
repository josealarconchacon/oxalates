import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsSectionComponent } from './results-section.component';

describe('ResultsSectionComponent', () => {
  let component: ResultsSectionComponent;
  let fixture: ComponentFixture<ResultsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const tiles = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll('.stat-tile')
    ) as HTMLElement[];
  const text = (el: Element | null) =>
    (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

  it('shows the same totals text as before, as two tiles', () => {
    expect(
      tiles().map((t) => [text(t.querySelector('dt')), text(t.querySelector('dd'))])
    ).toEqual([
      ['Total Oxalate:', '0.0 mg'],
      ['Total Soluble Oxalate:', '0.0 mg'],
    ]);
  });

  it('puts the value in the big number', () => {
    component.lunchItems = [
      { oxalatePerServing: 12.5, solubleOxalatePerServing: 2, numberOfServings: 2 },
    ];
    fixture.detectChanges();
    expect(tiles().map((t) => text(t.querySelector('.stat-number')))).toEqual([
      '25.0',
      '4.0',
    ]);
  });

  it('keeps share and download disabled until a food is added', () => {
    const buttons = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll('.action-btn')
      ) as HTMLButtonElement[];
    expect(buttons().map((b) => b.disabled)).toEqual([true, true]);

    component.snackItems = [{ oxalatePerServing: 1, numberOfServings: 1 }];
    fixture.detectChanges();
    expect(buttons().map((b) => b.disabled)).toEqual([false, false]);
  });
});

