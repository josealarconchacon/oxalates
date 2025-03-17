import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeCautiousComponent } from './be-cautious.component';

describe('BeCautiousComponent', () => {
  let component: BeCautiousComponent;
  let fixture: ComponentFixture<BeCautiousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeCautiousComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeCautiousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
