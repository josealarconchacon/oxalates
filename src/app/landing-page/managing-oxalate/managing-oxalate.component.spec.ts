import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ManagingOxalateComponent } from './managing-oxalate.component';
import { OxalateService } from './service/oxalate.service';
import { of } from 'rxjs';

fdescribe('ManagingOxalateComponent', () => {
  let component: ManagingOxalateComponent;
  let oxalateService: OxalateService;
  let fixture: ComponentFixture<ManagingOxalateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagingOxalateComponent],
      imports: [HttpClientTestingModule],
      providers: [OxalateService],
    });

    fixture = TestBed.createComponent(ManagingOxalateComponent);
    component = fixture.componentInstance;
    oxalateService = TestBed.inject(OxalateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch oxalate content on ngOnInit', () => {
    spyOn(oxalateService, 'getOxalateContent').and.returnValue(of(mockData));
    component.ngOnInit();
    expect(oxalateService.getOxalateContent).toHaveBeenCalled();
    expect(component.content).toEqual(mockData);
  });
});

const mockData = [{ id: 1, name: 'Sample Oxalate' }];
