import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { OxalateService } from './oxalate.service';

describe('OxalateService', () => {
  let service: OxalateService;
  let httpMock: HttpTestingController;
  const jsonUrl = '../../../../assets/mock-oxalate/oxalate-content.json';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OxalateService],
    });

    service = TestBed.inject(OxalateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOxalateContent', () => {
    it('should return an Observable', () => {
      const result = service.getOxalateContent();
      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
    });

    it('should make GET request to correct JSON file path', () => {
      service.getOxalateContent().subscribe();
      const req = httpMock.expectOne(jsonUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockOxalateData);
    });

    it('should fetch oxalate content from the JSON file', () => {
      service.getOxalateContent().subscribe((data) => {
        expect(data).toEqual(mockOxalateData);
      });

      const req = httpMock.expectOne(jsonUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockOxalateData);
    });

    it('should return data with title property', () => {
      service.getOxalateContent().subscribe((data) => {
        expect(data.title).toBe('Tips for Managing Oxalate Intake');
      });

      const req = httpMock.expectOne(jsonUrl);
      req.flush(mockOxalateData);
    });

    it('should return data with tips array', () => {
      service.getOxalateContent().subscribe((data) => {
        expect(Array.isArray(data.tips)).toBeTrue();
        expect(data.tips.length).toBe(5);
      });

      const req = httpMock.expectOne(jsonUrl);
      req.flush(mockOxalateData);
    });

    it('should return data with communitySupport property', () => {
      service.getOxalateContent().subscribe((data) => {
        expect(data.communitySupport).toBeDefined();
        expect(data.communitySupport).toContain('Trying Low Oxalates');
      });

      const req = httpMock.expectOne(jsonUrl);
      req.flush(mockOxalateData);
    });

    it('should return data with link property', () => {
      service.getOxalateContent().subscribe((data) => {
        expect(data.link).toBeDefined();
        expect(data.link).toMatch(/^https?:\/\//);
      });

      const req = httpMock.expectOne(jsonUrl);
      req.flush(mockOxalateData);
    });

    it('should handle HTTP error response', () => {
      const errorMessage = 'Failed to load';

      service.getOxalateContent().subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(jsonUrl);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', () => {
      service.getOxalateContent().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(jsonUrl);
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });

    it('should handle empty response', () => {
      service.getOxalateContent().subscribe((data) => {
        expect(data).toEqual({});
      });

      const req = httpMock.expectOne(jsonUrl);
      req.flush({});
    });

    it('should make only one HTTP request per call', () => {
      service.getOxalateContent().subscribe();

      const requests = httpMock.match(jsonUrl);
      expect(requests.length).toBe(1);
      requests[0].flush(mockOxalateData);
    });

    it('should not cache results between calls', () => {
      service.getOxalateContent().subscribe((data) => {
        expect(data).toEqual(mockOxalateData);
      });
      const req1 = httpMock.expectOne(jsonUrl);
      req1.flush(mockOxalateData);

      // should make another HTTP request
      service.getOxalateContent().subscribe((data) => {
        expect(data).toEqual(mockOxalateData);
      });
      const req2 = httpMock.expectOne(jsonUrl);
      req2.flush(mockOxalateData);
    });
  });

  describe('Service Configuration', () => {
    it('should use correct JSON file path', () => {
      expect(service['jsonUrl']).toBe(jsonUrl);
    });

    it('should have HttpClient injected', () => {
      expect(service['http']).toBeDefined();
    });
  });
});

const mockOxalateData = {
  title: 'Tips for Managing Oxalate Intake',
  tips: [
    {
      title: 'Stay Hydrated',
      description:
        'Drink at least 8-10 glasses of water daily to help dilute oxalates in your urine.',
    },
    {
      title: 'Mineral Intake',
      description:
        'Pair high-oxalate foods with mineral-rich foods or supplements like dairy or magnesium to reduce absorption.',
    },
    {
      title: 'Go Slowly',
      description:
        'Reduce oxalate by no more than 10% per week to minimize the risks of oxalate dumping.',
    },
    {
      title: 'Regular Monitoring',
      description:
        'Keep a food diary to track oxalate intake and identify triggers.',
    },
    {
      title: 'Consultation',
      description:
        'Consider consulting a dietitian that is well-versed in low-oxalate diets to receive tailored dietary recommendations that suit your individual needs.',
    },
  ],
  communitySupport:
    'Join the Trying Low Oxalates (TLO) community on Facebook to get support with your journey.',
  link: 'https://www.facebook.com/groups/135981539816730',
};
