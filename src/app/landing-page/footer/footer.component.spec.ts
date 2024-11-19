import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // To handle animations

fdescribe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [FooterComponent],
      imports: [
        MatIconModule, // Import MatIconModule
        NoopAnimationsModule, // Optional: to avoid animation issues during testing
      ],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should call router.navigate with correct route when search is called', () => {
    component.search();
    expect(router.navigate).toHaveBeenCalledWith(['/oxalate']);
  });
});
