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

describe('OxalateService', () => {
  let service: OxalateService;
  let httpMock: HttpTestingController;

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
      service.searchOxalateData('Spinach').subscribe((data) => {
        expect(data).toEqual([mockData[0]]);
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
    it('should not save an oxalate if it already exists', async () => {
      mockFirestore
        .collection()
        .doc()
        .collection()
        .ref.get.and.returnValue(
          Promise.resolve({ docs: [{ data: () => mockData[0] }] })
        );

      await service.saveOxalate(mockData[0]);

      expect(
        mockFirestore.collection().doc().collection().add
      ).not.toHaveBeenCalled();
    });
  });

  describe('deleteOxalate', () => {
    it('should delete an oxalate if it exists', async () => {
      const docRef = {
        get: jasmine.createSpy().and.returnValue(of({ exists: true })), // Use 'of' to return an observable
        delete: jasmine.createSpy().and.returnValue(Promise.resolve()),
      };

      mockFirestore.collection().doc().collection().doc.and.returnValue(docRef);

      await service.deleteOxalate('test-user-id', '1');

      expect(docRef.delete).toHaveBeenCalled();
    });

    it('should throw an error if oxalate does not exist', async () => {
      mockFirestore
        .collection()
        .doc()
        .collection()
        .doc()
        .get.and.returnValue(Promise.resolve({ exists: false }));
      await expectAsync(
        service.deleteOxalate('test-user-id', '1')
      ).toBeRejectedWithError();
    });
  });
});

const mockAuthService = {
  getCurrentUser: jasmine
    .createSpy()
    .and.returnValue(Promise.resolve({ uid: 'test-user-id' })),
};

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
    iconUrl: '',
    savedAt: '',
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
    iconUrl: '',
    savedAt: '',
  },
];
