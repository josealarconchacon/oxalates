import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuggestionFormComponent } from './suggestion-form.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { SuggestionForm } from '../../services/suggestions.service';

describe('SuggestionFormComponent', () => {
  let component: SuggestionFormComponent;
  let fixture: ComponentFixture<SuggestionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestionFormComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      title: new FormControl('Test Title'),
      description: new FormControl('Test Description'),
      category: new FormControl('General'),
    });
    fixture.detectChanges();
  });

  it('should emit submitted event when form is valid', () => {
    spyOn(component.submitted, 'emit');
    component.onSubmit();
    expect(component.submitted.emit).toHaveBeenCalledWith(mockValue);
  });

  it('should NOT emit submitted when form is invalid', () => {
    component.form.setErrors({ invalid: true });
    spyOn(component.submitted, 'emit');
    component.onSubmit();
    expect(component.submitted.emit).not.toHaveBeenCalled();
  });

  it('should mark controls as touched when form is invalid', () => {
    component.form.setErrors({ invalid: true });
    // spy on markAsTouched for each control
    Object.values(component.form.controls).forEach((control) => {
      spyOn(control, 'markAsTouched').and.callThrough();
    });

    component.onSubmit();
    Object.values(component.form.controls).forEach((control) => {
      expect(control.markAsTouched).toHaveBeenCalled();
      expect(control.touched).toBeTrue();
    });
  });
});

const mockValue: SuggestionForm = {
  title: 'Test Title',
  description: 'Test Description',
  category: 'General',
};
