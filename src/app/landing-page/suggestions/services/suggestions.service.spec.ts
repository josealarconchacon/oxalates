import { TestBed } from '@angular/core/testing';
import emailjs from '@emailjs/browser';
import { environment } from 'src/environments/environment';
import { SuggestionsService, CustomerFeedback } from './suggestions.service';

/**
 * emailjs.send is stubbed in every test. The real one posts to EmailJS with the
 * project's credentials and sends an actual email, so a spec must never reach it.
 */
describe('SuggestionsService', () => {
  let service: SuggestionsService;
  let sendSpy: jasmine.Spy;

  const payload: CustomerFeedback = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    feedback: 'Excellent guidance, thank you!',
  };

  beforeEach(() => {
    sendSpy = spyOn(emailjs, 'send').and.resolveTo({
      status: 200,
      text: 'OK',
    } as never);

    TestBed.configureTestingModule({ providers: [SuggestionsService] });
    service = TestBed.inject(SuggestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('does not send anything until it is subscribed to', () => {
    service.submitFeedback(payload);

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('sends the feedback with the configured EmailJS service, template and key', () => {
    service.submitFeedback(payload).subscribe();

    const { serviceId, templateId, publicKey } = environment.emailJs;
    expect(sendSpy).toHaveBeenCalledOnceWith(
      serviceId,
      templateId,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Excellent guidance, thank you!',
      },
      { publicKey }
    );
  });

  it('emits true once and completes when EmailJS accepts the message', (done) => {
    const emitted: boolean[] = [];

    service.submitFeedback(payload).subscribe({
      next: (result) => emitted.push(result),
      error: () => fail('submitFeedback should not error'),
      complete: () => {
        expect(emitted).toEqual([true]);
        done();
      },
    });
  });

  it('passes EmailJS errors through to the caller', (done) => {
    const failure = { status: 412, text: 'service account needs reconnecting' };
    sendSpy.and.rejectWith(failure);

    service.submitFeedback(payload).subscribe({
      next: () => fail('submitFeedback should not emit on failure'),
      error: (error) => {
        expect(error).toBe(failure);
        done();
      },
    });
  });

  it('does not write the visitor\'s feedback to the console', (done) => {
    const logSpy = spyOn(console, 'log');

    service.submitFeedback(payload).subscribe({
      complete: () => {
        expect(logSpy).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
