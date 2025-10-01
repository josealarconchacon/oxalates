import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuggestionsComponent } from './suggestions.component';
import {
  SuggestionsService,
  FAQ,
  SuggestionForm,
  SupportForm,
} from './services/suggestions.service';
import { of, throwError } from 'rxjs';

fdescribe('SuggestionsComponent', () => {
  let component: SuggestionsComponent;
  let fixture: ComponentFixture<SuggestionsComponent>;
  let mockSuggestionsService: jasmine.SpyObj<SuggestionsService>;

  beforeEach(async () => {
    mockSuggestionsService = jasmine.createSpyObj('SuggestionsService', [
      'getFaqs',
      'submitSuggestion',
      'submitSupport',
    ]);
    mockSuggestionsService.getFaqs.and.returnValue(of(mockFaqs));
    mockSuggestionsService.submitSuggestion.and.returnValue(
      of({ success: true })
    );
    mockSuggestionsService.submitSupport.and.returnValue(of(true));

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

  describe('ngOnInit', () => {
    it('should load FAQs on initialization', () => {
      fixture.detectChanges();

      expect(mockSuggestionsService.getFaqs).toHaveBeenCalled();
      expect(component.faqs).toEqual(mockFaqs);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when loading FAQs', () => {
      const error = new Error('Failed to load FAQs');
      mockSuggestionsService.getFaqs.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalledWith('Error loading FAQs:', error);
      expect(component.isLoading).toBeFalse();
    });

    it('should set isLoading during FAQ loading lifecycle', () => {
      expect(component.isLoading).toBeFalse();

      // trigger the private method's behavior
      component['isLoading'] = true; // Simulate what happens at start of loadFaqs
      expect(component.isLoading).toBeTrue();

      //  ngOnInit will set it back to false after completion
      component.ngOnInit();

      expect(mockSuggestionsService.getFaqs).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Form Initialization', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should initialize suggestionForm with correct fields and validators', () => {
      expect(component.suggestionForm.get('title')).toBeTruthy();
      expect(component.suggestionForm.get('category')).toBeTruthy();
      expect(component.suggestionForm.get('description')).toBeTruthy();

      const titleControl = component.suggestionForm.get('title');
      const descriptionControl = component.suggestionForm.get('description');

      expect(titleControl?.hasError('required')).toBeTrue();

      descriptionControl?.setValue('short');
      expect(descriptionControl?.hasError('minlength')).toBeTrue();
    });

    it('should validate suggestionForm description has minimum 20 characters', () => {
      const descriptionControl = component.suggestionForm.get('description');

      descriptionControl?.setValue('12345678901234567890');
      expect(descriptionControl?.hasError('minlength')).toBeFalse();

      descriptionControl?.setValue('short text');
      expect(descriptionControl?.hasError('minlength')).toBeTrue();
    });

    it('should initialize supportForm with correct fields and validators', () => {
      expect(component.supportForm.get('name')).toBeTruthy();
      expect(component.supportForm.get('email')).toBeTruthy();
      expect(component.supportForm.get('issueType')).toBeTruthy();
      expect(component.supportForm.get('message')).toBeTruthy();

      const emailControl = component.supportForm.get('email');
      const messageControl = component.supportForm.get('message');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTrue();

      messageControl?.setValue('short');
      expect(messageControl?.hasError('minlength')).toBeTrue();
    });

    it('should validate supportForm email correctly', () => {
      const emailControl = component.supportForm.get('email');

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBeFalse();

      emailControl?.setValue('invalid.email');
      expect(emailControl?.hasError('email')).toBeTrue();
    });

    it('should validate supportForm message has minimum 20 characters', () => {
      const messageControl = component.supportForm.get('message');

      messageControl?.setValue('12345678901234567890');
      expect(messageControl?.hasError('minlength')).toBeFalse();

      messageControl?.setValue('too short');
      expect(messageControl?.hasError('minlength')).toBeTrue();
    });
  });

  describe('switchTab', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should switch to suggestions tab', () => {
      component.activeTab = 'support';
      component.switchTab('suggestions');
      expect(component.activeTab).toBe('suggestions');
    });

    it('should switch to support tab', () => {
      component.activeTab = 'suggestions';
      component.switchTab('support');
      expect(component.activeTab).toBe('support');
    });

    it('should default to suggestions tab', () => {
      expect(component.activeTab).toBe('suggestions');
    });
  });

  describe('onSuggestionSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should submit suggestion successfully', () => {
      component.onSuggestionSubmit(validSuggestion);
      expect(mockSuggestionsService.submitSuggestion).toHaveBeenCalledWith(
        validSuggestion
      );
      expect(component.isLoading).toBeFalse();
    });

    it('should reset suggestionForm after successful submission', () => {
      component.suggestionForm.patchValue(validSuggestion);
      component.onSuggestionSubmit(validSuggestion);
      expect(component.suggestionForm.value).toEqual({
        title: null,
        category: null,
        description: null,
      });
    });

    it('should set isLoading to false after successful submission', () => {
      component.isLoading = true;

      component.onSuggestionSubmit(validSuggestion);

      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when submitting suggestion', () => {
      const error = new Error('Submission failed');
      mockSuggestionsService.submitSuggestion.and.returnValue(
        throwError(() => error)
      );
      spyOn(console, 'error');
      component.onSuggestionSubmit(validSuggestion);
      expect(console.error).toHaveBeenCalledWith(
        'Error submitting suggestion:',
        error
      );
      expect(component.isLoading).toBeFalse();
    });

    it('should not reset form when submission fails', () => {
      const error = new Error('Submission failed');
      mockSuggestionsService.submitSuggestion.and.returnValue(
        throwError(() => error)
      );
      component.suggestionForm.patchValue(validSuggestion);
      spyOn(console, 'error');
      component.onSuggestionSubmit(validSuggestion);
      expect(component.suggestionForm.value).toEqual(validSuggestion);
    });
  });

  describe('onSupportSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should submit support request successfully', () => {
      component.onSupportSubmit(validSupport);
      expect(mockSuggestionsService.submitSupport).toHaveBeenCalledWith(
        validSupport
      );
      expect(component.isLoading).toBeFalse();
    });

    it('should reset supportForm after successful submission', () => {
      component.supportForm.patchValue(validSupport);
      component.onSupportSubmit(validSupport);
      expect(component.supportForm.value).toEqual({
        name: null,
        email: null,
        issueType: null,
        message: null,
      });
    });

    it('should set isLoading to false after successful submission', () => {
      component.isLoading = true;
      component.onSupportSubmit(validSupport);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when submitting support request', () => {
      const error = new Error('Submission failed');
      mockSuggestionsService.submitSupport.and.returnValue(
        throwError(() => error)
      );
      spyOn(console, 'error');
      component.onSupportSubmit(validSupport);
      expect(console.error).toHaveBeenCalledWith(
        'Error submitting support request:',
        error
      );
      expect(component.isLoading).toBeFalse();
    });

    it('should not reset form when submission fails', () => {
      const error = new Error('Submission failed');
      mockSuggestionsService.submitSupport.and.returnValue(
        throwError(() => error)
      );
      component.supportForm.patchValue(validSupport);
      spyOn(console, 'error');
      component.onSupportSubmit(validSupport);
      expect(component.supportForm.value).toEqual(validSupport);
    });
  });

  describe('toggleFaq', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle FAQ isOpen property from false to true', () => {
      const faq = component.faqs[0];
      faq.isOpen = false;
      component.toggleFaq(faq);
      expect(faq.isOpen).toBeTrue();
    });

    it('should toggle FAQ isOpen property from true to false', () => {
      const faq = component.faqs[0];
      faq.isOpen = true;
      component.toggleFaq(faq);
      expect(faq.isOpen).toBeFalse();
    });

    it('should only toggle the specific FAQ', () => {
      const faq1 = component.faqs[0];
      const faq2 = component.faqs[1];
      faq1.isOpen = false;
      faq2.isOpen = false;
      component.toggleFaq(faq1);
      expect(faq1.isOpen).toBeTrue();
      expect(faq2.isOpen).toBeFalse();
    });

    it('should handle multiple toggles correctly', () => {
      const faq = component.faqs[0];
      faq.isOpen = false;
      component.toggleFaq(faq);
      expect(faq.isOpen).toBeTrue();
      component.toggleFaq(faq);
      expect(faq.isOpen).toBeFalse();
      component.toggleFaq(faq);
      expect(faq.isOpen).toBeTrue();
    });
  });
});

const mockFaqs: FAQ[] = [
  {
    question: 'How do I use this feature?',
    answer: 'You can use it by...',
    isOpen: false,
  },
  {
    question: 'What are the requirements?',
    answer: 'The requirements are...',
    isOpen: false,
  },
];

const validSuggestion: SuggestionForm = {
  title: 'Test Suggestion',
  category: 'feature',
  description:
    'This is a test suggestion with enough characters to pass validation',
};

const validSupport: SupportForm = {
  name: 'John Doe',
  email: 'john@example.com',
  issueType: 'technical',
  message:
    'This is a test support message with enough characters to meet requirements',
};
