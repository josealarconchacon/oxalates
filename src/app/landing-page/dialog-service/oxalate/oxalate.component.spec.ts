import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { provideRouter } from '@angular/router';
import { OxalateComponent } from './oxalate.component';
import { OxalateService } from '../service/oxalate.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { FilterComponent } from './filter/filter.component';
import { ViewMoreComponent } from './view-more/view-more.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { AlertComponent } from './shared/alert/alert.component';
import { ClickableDirective } from 'src/app/shared/directives/clickable.directive';

describe('OxalateComponent', () => {
  let component: OxalateComponent;
  let fixture: ComponentFixture<OxalateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule, // Add FormsModule here to provide ngModel
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        // The page's own building blocks, so the template is checked for real
        SearchInputComponent,
        AlertComponent,
        ClickableDirective,
      ],
      declarations: [OxalateComponent, FilterComponent, ViewMoreComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OxalateService,
        provideRouter([]),
      ],
    });
    fixture = TestBed.createComponent(OxalateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
