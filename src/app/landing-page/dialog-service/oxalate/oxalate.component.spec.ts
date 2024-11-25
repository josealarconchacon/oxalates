import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import the HttpClientTestingModule
import { OxalateComponent } from './oxalate.component';
import { OxalateService } from '../service/oxalate.service'; // Import your service if needed

describe('OxalateComponent', () => {
  let component: OxalateComponent;
  let fixture: ComponentFixture<OxalateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Add HttpClientTestingModule to the imports
      declarations: [OxalateComponent],
      providers: [OxalateService], // Provide your service if needed
    });
    fixture = TestBed.createComponent(OxalateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
