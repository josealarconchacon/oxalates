import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BaseFormComponent } from './base-form.component';

@Component({
  template: '',
})
class TestFormComponent extends BaseFormComponent {}

fdescribe('BaseFormComponent (via TestFormComponent)', () => {
  let component: TestFormComponent;
  let fixture: ComponentFixture<TestFormComponent>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestFormComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should emit submitted event with form value when form is valid', () => {
    component.form = formBuilder.group({
      name: ['Jasim', Validators.required],
      email: ['jasim@test.com', [Validators.required, Validators.email]],
    });
    spyOn(component.submitted, 'emit');
    component.onSubmit();
    expect(component.submitted.emit).toHaveBeenCalledWith(component.form.value);
  });

  it('should not emit submitted event when form is invalid', () => {
    component.form = formBuilder.group({
      name: ['', Validators.required], // Invalid: name is required.
      email: ['bademail', [Validators.required, Validators.email]], // Invalid email
    });

    spyOn(component.submitted, 'emit');
    component.onSubmit();
    expect(component.submitted.emit).not.toHaveBeenCalled();
  });
});
