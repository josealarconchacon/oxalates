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
import { IconComponent } from 'src/app/shared/components/icon/icon.component';

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
        IconComponent,
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

  describe('withUnit', () => {
    it('adds mg after numbers, including 0', () => {
      expect(component.withUnit('0.11')).toBe('0.11 mg');
      expect(component.withUnit('0')).toBe('0 mg');
      expect(component.withUnit(0.46)).toBe('0.46 mg');
    });

    it('shows words as they are, without mg', () => {
      expect(component.withUnit('uncalculated')).toBe('uncalculated');
      expect(component.withUnit('n/a')).toBe('n/a');
    });

    it('shows nothing for a missing value', () => {
      expect(component.withUnit(null)).toBe('');
      expect(component.withUnit('')).toBe('');
    });
  });
});

