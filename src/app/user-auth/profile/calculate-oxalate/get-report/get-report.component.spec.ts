import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetReportComponent } from './get-report.component';
import { FoodEntryService } from '../../food-entry/service/food-entry.service';

describe('GetReportComponent', () => {
  let component: GetReportComponent;
  let fixture: ComponentFixture<GetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetReportComponent],
      providers: [
        // The real service reads Firestore for the signed-in user
        {
          provide: FoodEntryService,
          useValue: jasmine.createSpyObj('FoodEntryService', ['getDailyEntry']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const pdfButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button.download-button.pdf');

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers a PDF download that is ready to use', () => {
    expect(pdfButton().disabled).toBeFalse();
    expect(pdfButton().textContent).toContain('Download PDF');
  });

  it('disables the PDF button and says it is preparing while the PDF loads', () => {
    component.isPreparingPdf = true;
    fixture.detectChanges();

    expect(pdfButton().disabled).toBeTrue();
    expect(pdfButton().textContent).toContain('Preparing PDF');
  });
});
