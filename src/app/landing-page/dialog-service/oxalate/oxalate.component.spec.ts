import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { OxalateComponent } from './oxalate.component';
import { OxalateService } from '../service/oxalate.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';

describe('OxalateComponent', () => {
  let component: OxalateComponent;
  let fixture: ComponentFixture<OxalateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule, // Add FormsModule here to provide ngModel
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
      ],
      declarations: [OxalateComponent],
      providers: [OxalateService],
    });
    fixture = TestBed.createComponent(OxalateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
