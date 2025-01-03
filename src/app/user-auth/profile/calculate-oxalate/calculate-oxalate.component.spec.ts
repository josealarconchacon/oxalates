import { CalculateOxalateComponent } from './calculate-oxalate.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('CalculateOxalateComponent', () => {
  let component: CalculateOxalateComponent;
  let fixture: ComponentFixture<CalculateOxalateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculateOxalateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculateOxalateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
