import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './landing-page/header/header.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { of } from 'rxjs';

const mockFirebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'fake-auth-domain',
  projectId: 'fake-project-id',
  storageBucket: 'fake-storage-bucket',
  messagingSenderId: 'fake-messaging-sender-id',
  appId: 'fake-app-id',
};

class MockAngularFireAuth {
  authState = of(null);
  signInWithEmailAndPassword() {
    return of({ user: null });
  }
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularFireModule.initializeApp(mockFirebaseConfig)],
      declarations: [AppComponent, HeaderComponent],
      providers: [{ provide: AngularFireAuth, useClass: MockAngularFireAuth }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should have as title "oxalates"', () => {
    expect(app.title).toEqual('oxalates');
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'oxalates'
    );
  });

  it('should render app-header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });
});
