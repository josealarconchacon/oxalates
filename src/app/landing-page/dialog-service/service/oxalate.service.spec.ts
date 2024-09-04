import { TestBed } from '@angular/core/testing';

import { OxalateService } from './oxalate.service';

describe('OxalateService', () => {
  let service: OxalateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OxalateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
