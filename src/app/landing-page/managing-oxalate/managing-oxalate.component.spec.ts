import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagingOxalateComponent } from './managing-oxalate.component';

describe('ManagingOxalateComponent', () => {
  let component: ManagingOxalateComponent;
  let fixture: ComponentFixture<ManagingOxalateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagingOxalateComponent]
    });
    fixture = TestBed.createComponent(ManagingOxalateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
