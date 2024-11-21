import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { BenefitsComponent } from './benefits.component';
import { BenefitsService } from './service/benefits.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('BenefitsComponent', () => {
  let component: BenefitsComponent;
  let fixture: ComponentFixture<BenefitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BenefitsComponent],
      providers: [
        BenefitsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(BenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
