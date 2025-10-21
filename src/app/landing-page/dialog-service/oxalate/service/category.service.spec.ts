import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null category value', (done) => {
    service.currentCategory$.subscribe((value) => {
      expect(value).toBeNull();
      done();
    });
  });

  it('should emit new category when changeCategory is called', (done) => {
    const category = 'Fruits';
    // Skip first emission (null), then test next
    let emissionCount = 0;
    service.currentCategory$.subscribe((value) => {
      emissionCount++;
      if (emissionCount === 2) {
        expect(value).toBe(category);
        done();
      }
    });
    service.changeCategory(category);
  });

  it('should reset category to null when clearAll is called', (done) => {
    const emissions: (string | null)[] = [];
    service.currentCategory$.subscribe((value) => {
      emissions.push(value);
      if (emissions.length === 3) {
        // Emissions: [null, 'Vegetables', null]
        expect(emissions).toEqual([null, 'Vegetables', null]);
        done();
      }
    });
    service.changeCategory('Vegetables');
    service.clearAll();
  });

  it('should emit correct sequence of category changes', (done) => {
    const expected = [null, 'Nuts', 'Dairy', null];
    const emitted: (string | null)[] = [];
    service.currentCategory$.subscribe((value) => {
      emitted.push(value);
      if (emitted.length === expected.length) {
        expect(emitted).toEqual(expected);
        done();
      }
    });
    service.changeCategory('Nuts');
    service.changeCategory('Dairy');
    service.clearAll();
  });
});
