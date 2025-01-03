import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServingPanelComponent } from './serving-panel.component';

describe('ServingPanelComponent', () => {
  let component: ServingPanelComponent;
  let fixture: ComponentFixture<ServingPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServingPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServingPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
