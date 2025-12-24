import { TestBed } from '@angular/core/testing';
import { SuggestionsService, CustomerFeedback } from './suggestions.service';

describe('SuggestionsService', () => {
  let service: SuggestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SuggestionsService],
    });
    service = TestBed.inject(SuggestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true when submitting feedback', (done) => {
    const payload: CustomerFeedback = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      feedback: 'Excellent guidance, thank you!',
    };

    service.submitFeedback(payload).subscribe({
      next: (result) => {
        expect(result).toBeTrue();
        done();
      },
      error: () => {
        fail('submitFeedback should not error');
      },
    });
  });

  it('should log the submitted payload', () => {
    const payload: CustomerFeedback = {
      name: 'John Smith',
      email: 'john@example.com',
      feedback: 'This is a simple feedback message.',
    };
    const logSpy = spyOn(console, 'log');

    service.submitFeedback(payload).subscribe();

    expect(logSpy).toHaveBeenCalledWith(
      'Customer feedback submitted:',
      payload
    );
  });
});
