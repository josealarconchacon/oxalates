import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BenefitsService, BenefitsData } from './benefits.service';

describe('BenefitsService', () => {
  let service: BenefitsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BenefitsService],
    });

    service = TestBed.inject(BenefitsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch benefits data', () => {
    service.getBenefits().subscribe((data) => {
      expect(data).toEqual(mockBenefitsData);
    });

    const req = httpTestingController.expectOne(service['jsonUrl']);
    expect(req.request.method).toBe('GET');
    req.flush(mockBenefitsData);
  });

  it('should handle HTTP errors', () => {
    const errorMessage = 'Failed to load';

    service.getBenefits().subscribe(
      () => fail('Expected an error, not benefits data'),
      (error) => {
        expect(error.status).toBe(500);
        expect(error.error).toBe(errorMessage);
      }
    );

    const req = httpTestingController.expectOne(service['jsonUrl']);
    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
});

const mockBenefitsData: BenefitsData = {
  benefits: [
    {
      icon: 'icon1.png',
      title: 'Benefit 1',
      description: 'Description of Benefit 1',
    },
    {
      icon: 'icon2.png',
      title: 'Benefit 2',
      description: 'Description of Benefit 2',
    },
  ],
};
