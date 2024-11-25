import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewMoreComponent } from './view-more.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';

describe('ViewMoreComponent', () => {
  let component: ViewMoreComponent;
  let fixture: ComponentFixture<ViewMoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewMoreComponent],
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
      ],
    });

    fixture = TestBed.createComponent(ViewMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
