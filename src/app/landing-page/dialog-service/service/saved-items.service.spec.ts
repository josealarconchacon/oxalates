import { TestBed } from '@angular/core/testing';

import { SavedItemsService } from './saved-items.service';

describe('SavedItemsService', () => {
  let service: SavedItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavedItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
