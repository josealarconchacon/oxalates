import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { OxalateService } from './oxalate.service';

describe('OxalateService', () => {
  let service: OxalateService;
  let httpMock: HttpTestingController;

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
    it('should fetch oxalate content from the JSON file', () => {
      service.getOxalateContent().subscribe((data) => {
        expect(data).toEqual(mockOxalateData);
      });

      const req = httpMock.expectOne(
        '../../../../assets/mock-oxalate/oxalate-content.json'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockOxalateData);
    });
  });
});

const mockOxalateData = [
  { item: 'Spinach', total_oxalate_mg_per_100g: 970 },
  { item: 'Potato', total_oxalate_mg_per_100g: 24 },
];
