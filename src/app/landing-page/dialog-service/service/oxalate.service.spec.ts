import { TestBed } from '@angular/core/testing';
import { OxalateService } from './oxalate.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { of } from 'rxjs';
import { Oxalate } from '../../model/oxalate';

const mockFirestore = {
  collection: jasmine.createSpy().and.returnValue({
    doc: jasmine.createSpy().and.returnValue({
      collection: jasmine.createSpy().and.returnValue({
        add: jasmine
          .createSpy()
          .and.returnValue(Promise.resolve({ id: 'test-id' })),
        ref: {
          get: jasmine
            .createSpy()
            .and.returnValue(Promise.resolve({ docs: [] })),
        },
        doc: jasmine.createSpy().and.returnValue({
          get: jasmine
            .createSpy()
            .and.returnValue(Promise.resolve({ exists: true })),
          delete: jasmine.createSpy().and.returnValue(Promise.resolve()),
        }),
      }),
    }),
  }),
};

const mockAuthService = {
  getCurrentUser: jasmine
    .createSpy()
    .and.returnValue(Promise.resolve({ uid: 'test-user-id' })),
};

fdescribe('OxalateService', () => {
  let service: OxalateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OxalateService,
        { provide: AngularFirestore, useValue: mockFirestore },
        { provide: AuthService, useValue: mockAuthService },
      ],
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

  describe('getOxalateData', () => {
    it('should fetch oxalate data', () => {
      service.getOxalateData().subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(
        'assets/mock-oxalate/oxolateListData.json'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('searchOxalateData', () => {
    it('should return filtered data for search query', () => {
      service.searchOxalateData('spinach').subscribe((data) => {
        expect(data).toEqual(mockFilterData);
      });

      const req = httpMock.expectOne(
        'assets/mock-oxalate/oxolateListData.json'
      );
      req.flush(mockData);
    });

    it('should return all data when query is empty', () => {
      service.searchOxalateData('').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(
        'assets/mock-oxalate/oxolateListData.json'
      );
      req.flush(mockData);
    });
  });

  describe('saveOxalate', () => {
    it('should save a new oxalate item if it does not exist', async () => {
      mockFirestore
        .collection()
        .doc()
        .collection()
        .ref.get.and.returnValue(Promise.resolve({ docs: [] }));

      await service.saveOxalate(oxalate);

      expect(mockFirestore.collection).toHaveBeenCalledWith('savedOxalates');
      expect(
        mockFirestore.collection().doc().collection().add
      ).toHaveBeenCalledWith({ ...oxalate });
    });

    it('should not save an oxalate item if it already exists', async () => {
      mockFirestore
        .collection()
        .doc()
        .collection()
        .ref.get.and.returnValue(
          Promise.resolve({
            docs: [{ data: () => ({ item: 'Spinach' }) }],
          })
        );

      await service.saveOxalate(oxalate);

      expect(
        mockFirestore.collection().doc().collection().add
      ).not.toHaveBeenCalled();
    });
  });
});

const mockData: Oxalate[] = [
  {
    id: '1',
    item: 'Spinach',
    calc_level: 'high',
    category: '',
    level: '',
    total_oxalate_mg_per_100g: '',
    total_soluble_oxalate_mg_per_100g: null,
    serving_size: null,
    serving_g: null,
    calc_oxalate_per_serving: '',
    calc_soluble_mg_oxalate_per_serving: '',
    soluble_oxalate: '',
    reference: '',
    notes: '',
  },
  {
    id: '2',
    item: 'Carrot',
    calc_level: 'low',
    category: '',
    level: '',
    total_oxalate_mg_per_100g: '',
    total_soluble_oxalate_mg_per_100g: null,
    serving_size: null,
    serving_g: null,
    calc_oxalate_per_serving: '',
    calc_soluble_mg_oxalate_per_serving: '',
    soluble_oxalate: '',
    reference: '',
    notes: '',
  },
];

const mockFilterData: Oxalate[] = [
  {
    id: '1',
    item: 'Spinach',
    calc_level: 'high',
    category: '',
    level: '',
    total_oxalate_mg_per_100g: '',
    total_soluble_oxalate_mg_per_100g: null,
    serving_size: null,
    serving_g: null,
    calc_oxalate_per_serving: '',
    calc_soluble_mg_oxalate_per_serving: '',
    soluble_oxalate: '',
    reference: '',
    notes: '',
  },
];

const oxalate: Oxalate = {
  id: '1',
  item: 'Spinach',
  calc_level: 'high',
  category: '',
  level: '',
  total_oxalate_mg_per_100g: '',
  total_soluble_oxalate_mg_per_100g: null,
  serving_size: null,
  serving_g: null,
  calc_oxalate_per_serving: '',
  calc_soluble_mg_oxalate_per_serving: '',
  soluble_oxalate: '',
  reference: '',
  notes: '',
};
