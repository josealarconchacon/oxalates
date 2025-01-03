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
});
