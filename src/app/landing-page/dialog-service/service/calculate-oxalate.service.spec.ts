import { TestBed } from '@angular/core/testing';
import { CalculateOxalateService } from './calculate-oxalate.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

interface SimilarFood {
  name: string;
  totalOxalate: number;
  solubleOxalate: number;
  similarity: number;
  servingGrams: number;
}

interface OxalateData {
  item: string | null;
  serving_size: number | null;
  calc_oxalate_per_serving: number | null;
  calc_soluble_mg_oxalate_per_serving: number | null;
}

describe('CalculateOxalateService', () => {
  let service: CalculateOxalateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CalculateOxalateService);
    httpMock = TestBed.inject(HttpTestingController);

    // initialize oxalate data
    const req = httpMock.expectOne('assets/mock-oxalate/oxolateListData.json');
    req.flush(mockOxalateData);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateOxalate', () => {
    it('should return correct values for known food', () => {
      const result = service.calculateOxalate('Spinach', 100);
      expect(result.totalOxalate).toBe(750);
      expect(result.solubleOxalate).toBe(100);
    });

    it('should throw error if food does not exist', () => {
      expect(() => service.calculateOxalate('Unknown', 50)).toThrowError(
        'Food not found'
      );
    });
  });

  describe('findSimilarFoods', () => {
    it('should find similar foods and sort by similarity', () => {
      const results: SimilarFood[] = service.findSimilarFoods('Spin');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Spinach');
      expect(results[0].similarity).toBeGreaterThan(0.2);
    });

    it('should return empty array for blank input', () => {
      expect(service.findSimilarFoods('    ')).toEqual([]);
    });

    it('should return all required fields', () => {
      const results = service.findSimilarFoods('almonds');
      expect(results[0].name).toBe('Almonds');
      expect(typeof results[0].totalOxalate).toBe('number');
      expect(typeof results[0].solubleOxalate).toBe('number');
      expect(typeof results[0].similarity).toBe('number');
      expect(typeof results[0].servingGrams).toBe('number');
    });
  });

  describe('getConfidenceLevel', () => {
    it('should categorize similarity accurately', () => {
      expect(service.getConfidenceLevel(0.85)).toBe('Very High');
      expect(service.getConfidenceLevel(0.65)).toBe('High');
      expect(service.getConfidenceLevel(0.45)).toBe('Medium');
      expect(service.getConfidenceLevel(0.2)).toBe('Low');
    });
  });
});

const mockOxalateData: OxalateData[] = [
  {
    item: 'Spinach',
    serving_size: 100,
    calc_oxalate_per_serving: 750,
    calc_soluble_mg_oxalate_per_serving: 100,
  },
  {
    item: 'Almonds',
    serving_size: 28,
    calc_oxalate_per_serving: 122,
    calc_soluble_mg_oxalate_per_serving: 10,
  },
  {
    item: 'Potato',
    serving_size: 150,
    calc_oxalate_per_serving: 80,
    calc_soluble_mg_oxalate_per_serving: 30,
  },
];
