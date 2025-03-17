import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  SuggestionsService,
  FAQ,
  SuggestionForm,
  SupportForm,
} from './services/suggestions.service';
import { SuggestionFormComponent } from './components/suggestion-form/suggestion-form.component';
import { SupportFormComponent } from './components/support-form/support-form.component';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SuggestionFormComponent,
    SupportFormComponent,
  ],
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css'],
})
export class SuggestionsComponent implements OnInit {
  activeTab: 'suggestions' | 'support' = 'suggestions';
  suggestionForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    category: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
  });
  supportForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    issueType: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(20)]],
  });
  faqs: FAQ[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private suggestionsService: SuggestionsService
  ) {}

  ngOnInit(): void {
    this.loadFaqs();
  }

  private loadFaqs(): void {
    this.isLoading = true;
    this.suggestionsService.getFaqs().subscribe({
      next: (faqs) => {
        this.faqs = faqs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
        this.isLoading = false;
      },
    });
  }

  switchTab(tab: 'suggestions' | 'support'): void {
    this.activeTab = tab;
  }

  onSuggestionSubmit(suggestion: SuggestionForm): void {
    this.isLoading = true;
    this.suggestionsService.submitSuggestion(suggestion).subscribe({
      next: () => {
        this.suggestionForm.reset();
        this.isLoading = false;
        // TODO: Add success message/toast
      },
      error: (error) => {
        console.error('Error submitting suggestion:', error);
        this.isLoading = false;
        // TODO: Add error message/toast
      },
    });
  }

  onSupportSubmit(support: SupportForm): void {
    this.isLoading = true;
    this.suggestionsService.submitSupport(support).subscribe({
      next: () => {
        this.supportForm.reset();
        this.isLoading = false;
        // TODO: Add success message/toast
      },
      error: (error) => {
        console.error('Error submitting support request:', error);
        this.isLoading = false;
        // TODO: Add error message/toast
      },
    });
  }

  toggleFaq(faq: FAQ): void {
    faq.isOpen = !faq.isOpen;
  }
}
