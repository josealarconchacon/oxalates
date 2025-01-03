import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ResourcesComponent } from './resources.component';
import { ResourceService } from '../dialog-service/service/resource.service';

@Component({
  selector: 'app-benefits',
  template: '',
})
class MockBenefitsComponent {}

// Mock ResourceService
class MockResourceService {
  getFoodResources() {
    return [];
  }
}

describe('ResourcesComponent', () => {
  let component: ResourcesComponent;
  let fixture: ComponentFixture<ResourcesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResourcesComponent, MockBenefitsComponent],
      providers: [{ provide: ResourceService, useClass: MockResourceService }],
    });
    fixture = TestBed.createComponent(ResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
