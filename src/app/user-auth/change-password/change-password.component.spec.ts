import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordComponent } from './change-password.component';
import { AuthService } from '../service/auth-service.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment.development';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { of } from 'rxjs';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let authServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      changePassword: jasmine
        .createSpy('changePassword')
        .and.returnValue(of(true)),
    };

    TestBed.configureTestingModule({
      declarations: [ChangePasswordComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        AngularFireAuth,
      ],
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        ReactiveFormsModule, // Add this import to enable reactive forms
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
