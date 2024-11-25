import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SaveItemsComponent } from './save-items.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';

// Mock db configuration
const firebaseConfig = {
  apiKey: 'mock-api-key',
  authDomain: 'mock-auth-domain',
  projectId: 'mock-project-id',
  storageBucket: 'mock-storage-bucket',
  messagingSenderId: 'mock-messaging-sender-id',
  appId: 'mock-app-id',
};

// Mock AngularFirestore
const angularFirestoreMock = {
  collection: jasmine.createSpy('collection').and.returnValue({
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
    doc: jasmine.createSpy('doc').and.returnValue({
      set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
    }),
  }),
};

describe('SaveItemsComponent', () => {
  let component: SaveItemsComponent;
  let fixture: ComponentFixture<SaveItemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaveItemsComponent],
      imports: [
        HttpClientTestingModule,
        AngularFireModule.initializeApp(firebaseConfig),
      ],
      providers: [
        { provide: AngularFirestore, useValue: angularFirestoreMock },
      ],
    });
    fixture = TestBed.createComponent(SaveItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
