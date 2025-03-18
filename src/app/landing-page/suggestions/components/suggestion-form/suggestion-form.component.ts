import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { SuggestionForm } from '../../services/suggestions.service';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator.component';

@Component({
  selector: 'app-suggestion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingIndicatorComponent],
  templateUrl: './suggestion-form.component.html',
  styleUrls: ['../../suggestions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionFormComponent {
  @Input() form!: FormGroup;
  @Input() isSubmitting = false;
  @Output() readonly submitted = new EventEmitter<SuggestionForm>();

  readonly LOADING_KEY = 'suggestion-form-submit' as const;

  onSubmit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.getRawValue() as SuggestionForm);
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    (Object.values(formGroup.controls) as AbstractControl[]).forEach(
      (control: AbstractControl) => {
        control.markAsTouched();

        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    );
  }
}
