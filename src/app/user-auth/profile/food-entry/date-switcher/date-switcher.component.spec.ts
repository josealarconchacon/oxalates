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
});
