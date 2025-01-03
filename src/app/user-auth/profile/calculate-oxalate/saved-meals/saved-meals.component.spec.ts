import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedMealsComponent } from './saved-meals.component';

describe('SavedMealsComponent', () => {
  let component: SavedMealsComponent;
  let fixture: ComponentFixture<SavedMealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedMealsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
