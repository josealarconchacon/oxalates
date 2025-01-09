import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealTotalsComponent } from './meal-totals.component';

describe('MealTotalsComponent', () => {
  let component: MealTotalsComponent;
  let fixture: ComponentFixture<MealTotalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealTotalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
