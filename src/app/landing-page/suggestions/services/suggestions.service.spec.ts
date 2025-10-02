import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  SuggestionsService,
  FAQ,
  SuggestionForm,
  SupportForm,
} from './suggestions.service';
import { environment } from 'src/environments/environment.development';

fdescribe('SuggestionsService', () => {
  let service: SuggestionsService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.firebaseConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SuggestionsService],
    });
    service = TestBed.inject(SuggestionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFaqs', () => {
    it('should return an Observable of FAQ array', (done) => {
      service.getFaqs().subscribe({
        next: (faqs) => {
          expect(faqs).toBeTruthy();
          expect(Array.isArray(faqs)).toBeTrue();
          expect(faqs.length).toBe(4);
          done();
        },
      });
    });

    it('should return FAQs with correct structure', (done) => {
      service.getFaqs().subscribe({
        next: (faqs) => {
          faqs.forEach((faq) => {
            expect(faq.question).toBeDefined();
            expect(faq.answer).toBeDefined();
            expect(faq.isOpen).toBeDefined();
            expect(typeof faq.question).toBe('string');
            expect(typeof faq.answer).toBe('string');
            expect(typeof faq.isOpen).toBe('boolean');
          });
          done();
        },
      });
    });

    it('should return FAQs with isOpen set to false by default', (done) => {
      service.getFaqs().subscribe({
        next: (faqs) => {
          faqs.forEach((faq) => {
            expect(faq.isOpen).toBeFalse();
          });
          done();
        },
      });
    });

    it('should include FAQ about tracking daily oxalate intake', (done) => {
      service.getFaqs().subscribe({
        next: (faqs) => {
          const trackingFaq = faqs.find((faq) =>
            faq.question.includes('track my daily oxalate intake')
          );
          expect(trackingFaq).toBeDefined();
          expect(trackingFaq?.answer).toContain('Calculate Daily Intake');
          done();
        },
      });
    });

    it('should include FAQ about oxalate content accuracy', (done) => {
      service.getFaqs().subscribe({
        next: (faqs) => {
          const accuracyFaq = faqs.find((faq) =>
            faq.question.includes('How accurate is the oxalate content data')
          );
          expect(accuracyFaq).toBeDefined();
          expect(accuracyFaq?.answer).toContain(
            'peer-reviewed scientific studies'
          );
          done();
        },
      });
    });

    it('should include FAQ about exporting data', (done) => {
      service.getFaqs().subscribe({
        next: (faqs) => {
          const exportFaq = faqs.find((faq) =>
            faq.question.includes('export my tracking data')
          );
          expect(exportFaq).toBeDefined();
          expect(exportFaq?.answer).toContain('CSV format');
          done();
        },
      });
    });

    it('should include FAQ about updating account information', (done) => {
      service.getFaqs().subscribe({
        next: (faqs) => {
          const accountFaq = faqs.find((faq) =>
            faq.question.includes('update my account information')
          );
          expect(accountFaq).toBeDefined();
          expect(accountFaq?.answer).toContain('profile settings');
          done();
        },
      });
    });
  });

  describe('submitSuggestion', () => {
    it('should make POST request to correct endpoint', () => {
      service.submitSuggestion(mockSuggestion).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/submitSuggestion`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSuggestion);
      req.flush(mockResponse);
    });

    it('should handle suggestion with all required fields', () => {
      service.submitSuggestion(suggestion).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/submitSuggestion`);
      expect(req.request.body.title).toBe('New Feature Request');
      expect(req.request.body.category).toBe('enhancement');
      expect(req.request.body.description).toBe(
        'Please add this amazing feature to the application'
      );
      req.flush({ success: true });
    });

    it('should handle HTTP error response', () => {
      service.submitSuggestion(mockSuggestionTest).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/submitSuggestion`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('should accept any type of suggestion object', () => {
      service.submitSuggestion(customSuggestion).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/submitSuggestion`);
      expect(req.request.body).toEqual(customSuggestion);
      req.flush({ success: true });
    });
  });

  describe('submitSupport', () => {
    it('should return Observable<boolean> with true value', (done) => {
      service.submitSupport(mockSupport).subscribe({
        next: (result) => {
          expect(result).toBeTrue();
          done();
        },
      });
    });

    it('should log support request to console', () => {
      spyOn(console, 'log');
      service.submitSupport(mockSupportTest).subscribe();

      expect(console.log).toHaveBeenCalledWith(
        'Support request submitted:',
        mockSupportTest
      );
    });

    it('should handle support with all required fields', (done) => {
      service.submitSupport(support).subscribe({
        next: (result) => {
          expect(result).toBe(true);
          expect(typeof result).toBe('boolean');
          done();
        },
      });
    });

    it('should return observable that completes synchronously', (done) => {
      let completed = false;

      service.submitSupport(supportTest).subscribe({
        next: () => {
          completed = true;
        },
        complete: () => {
          expect(completed).toBeTrue();
          done();
        },
      });
    });
  });

  describe('Service Configuration', () => {
    it('should use correct API URL from environment', () => {
      expect(service['apiUrl']).toBe(environment.firebaseConfig);
    });

    it('should have HttpClient injected', () => {
      expect(service['http']).toBeDefined();
    });
  });
});

const mockSuggestion: SuggestionForm = {
  title: 'Test Suggestion',
  category: 'feature',
  description: 'This is a test suggestion with enough characters',
};

const mockResponse = { success: true, id: '123' };

const suggestion: SuggestionForm = {
  title: 'New Feature Request',
  category: 'enhancement',
  description: 'Please add this amazing feature to the application',
};

const mockSuggestionTest = {
  title: 'Test',
  category: 'bug',
  description: 'Test description with minimum characters',
};
const errorMessage = 'Server error';

const customSuggestion = {
  title: 'Custom',
  customField: 'value',
  anotherField: 123,
};

const mockSupport: SupportForm = {
  name: 'John Doe',
  email: 'john@example.com',
  issueType: 'technical',
  message: 'This is a test support message with enough characters',
};

const mockSupportTest: SupportForm = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  issueType: 'billing',
  message: 'I have a billing question about my subscription',
};
const support: SupportForm = {
  name: 'Test User',
  email: 'test@test.com',
  issueType: 'account',
  message: 'I need help with my account settings and preferences',
};

const supportTest: SupportForm = {
  name: 'Quick Test',
  email: 'quick@test.com',
  issueType: 'other',
  message: 'This should complete synchronously without network delay',
};
