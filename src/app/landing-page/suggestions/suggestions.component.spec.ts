import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuggestionsComponent } from './suggestions.component';
import { SuggestionsService } from './services/suggestions.service';
import { of, throwError } from 'rxjs';

describe('SuggestionsComponent', () => {
  let component: SuggestionsComponent;
  let fixture: ComponentFixture<SuggestionsComponent>;
  let mockSuggestionsService: jasmine.SpyObj<SuggestionsService>;

  beforeEach(async () => {
    mockSuggestionsService = jasmine.createSpyObj('SuggestionsService', [
      'submitFeedback',
    ]);
    mockSuggestionsService.submitFeedback.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [SuggestionsComponent],
      providers: [
        { provide: SuggestionsService, useValue: mockSuggestionsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize feedback form with required controls', () => {
    expect(component.feedbackForm.get('name')).toBeTruthy();
    expect(component.feedbackForm.get('email')).toBeTruthy();
    expect(component.feedbackForm.get('feedback')).toBeTruthy();

    expect(component.feedbackForm.get('name')?.hasError('required')).toBeTrue();
    expect(component.feedbackForm.get('email')?.hasError('required')).toBeTrue();
    expect(component.feedbackForm.get('feedback')?.hasError('required')).toBeTrue();
  });

  it('should call submitFeedback when the form is valid', () => {
    component.feedbackForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      feedback: 'This is valid feedback with more than 20 chars.',
    });

    component.submitFeedback();

    expect(mockSuggestionsService.submitFeedback).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      feedback: 'This is valid feedback with more than 20 chars.',
    });
    expect(component.submissionSuccess).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  it('should not submit when the form is invalid', () => {
    component.feedbackForm.setValue({
      name: '',
      email: 'not-an-email',
      feedback: 'short',
    });

    component.submitFeedback();

    expect(mockSuggestionsService.submitFeedback).not.toHaveBeenCalled();
    expect(component.submissionSuccess).toBeFalse();
    expect(component.isLoading).toBeFalse();
  });

  it('should handle submission errors gracefully', () => {
    const error = new Error('Submission failed');
    mockSuggestionsService.submitFeedback.and.returnValue(
      throwError(() => error)
    );

    component.feedbackForm.setValue({
      name: 'Error Tester',
      email: 'error@example.com',
      feedback: 'This feedback is lengthy enough to pass validation.',
    });

    component.submitFeedback();

    expect(component.submissionSuccess).toBeFalse();
    expect(component.submissionError).toContain('We could not send your feedback');
    expect(component.isLoading).toBeFalse();
  });
});
