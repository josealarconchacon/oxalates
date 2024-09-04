import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMoreComponent } from './view-more.component';

describe('ViewMoreComponent', () => {
  let component: ViewMoreComponent;
  let fixture: ComponentFixture<ViewMoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewMoreComponent]
    });
    fixture = TestBed.createComponent(ViewMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
