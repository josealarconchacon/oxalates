import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuggestionsService, CustomerFeedback } from './services/suggestions.service';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css'],
})
export class SuggestionsComponent {
  feedbackForm: FormGroup;
  isLoading = false;
  submissionSuccess = false;
  submissionError?: string;

  constructor(
    private fb: FormBuilder,
    private suggestionsService: SuggestionsService
  ) {
    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      feedback: ['', [Validators.required, Validators.minLength(20)]],
    });
  }

  submitFeedback(): void {
    if (this.feedbackForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.submissionError = undefined;
    this.submissionSuccess = false;

    const payload = this.feedbackForm.value as CustomerFeedback;

    this.suggestionsService.submitFeedback(payload).subscribe({
      next: () => {
        this.submissionSuccess = true;
        this.feedbackForm.reset();
        this.isLoading = false;
      },
      error: (error) => {
        this.submissionError =
          error?.message || 'We could not send your feedback right now.';
        this.isLoading = false;
      },
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.feedbackForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}
