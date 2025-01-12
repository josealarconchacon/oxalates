import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodEntryComponent } from './food-entry.component';
import { AngularFireModule } from '@angular/fire/compat';
import {
  AngularFirestoreModule,
  AngularFirestore,
} from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

class MockAngularFirestore {
  collection() {
    return {
      add: jasmine.createSpy('add').and.returnValue(Promise.resolve()),
      valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
    };
  }
}

describe('FoodEntryComponent', () => {
  let component: FoodEntryComponent;
  let fixture: ComponentFixture<FoodEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FoodEntryComponent,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
      ],
      providers: [
        { provide: AngularFirestore, useClass: MockAngularFirestore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
