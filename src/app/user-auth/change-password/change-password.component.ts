import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth-service.service';
import { AlertService } from 'src/app/shared/alert-service/alert.service';

const FOCUSABLE_SELECTOR =
  'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit, OnChanges {
  passwordForm!: FormGroup;
  isSubmitting = false;
  showAlert: boolean = false;
  alertMessage: string = '';

  @Input() isVisible: boolean = false;
  @Input() triggerElement: ElementRef<HTMLElement> | HTMLElement | null = null;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalContent') modalContent!: ElementRef<HTMLElement>;

  private previouslyFocusedElement: HTMLElement | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
    this.alertService.getAlertObservable().subscribe((alert) => {
      this.alertMessage = alert.message;
      this.showAlert = alert.show;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      const t = this.triggerElement;
      const el =
        t && 'nativeElement' in t
          ? (t as ElementRef<HTMLElement>).nativeElement
          : (t as HTMLElement | null);
      this.previouslyFocusedElement =
        el ?? (document.activeElement as HTMLElement);
      setTimeout(() => this.focusFirstFocusable(), 0);
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const el = this.modalContent?.nativeElement;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }

  private focusFirstFocusable(): void {
    const focusable = this.getFocusableElements();
    focusable[0]?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isVisible) {
      this.onClose();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isVisible) return;
    if (event.key === 'Tab') {
      const focusable = this.getFocusableElements();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const { newPassword, confirmPassword } = formGroup.controls;
    return newPassword.value === confirmPassword.value
      ? null
      : { mismatch: true };
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.isSubmitting = true; // Set isSubmitting to true

    this.authService
      .changePassword(currentPassword, newPassword)
      .then(() => {
        this.alertService.showAlert('Password changed successfully!');
        this.passwordForm.reset();
        if (this.previouslyFocusedElement) {
          this.previouslyFocusedElement.focus();
        }
        this.close.emit();
      })
      .catch((error) => {
        console.error('Error changing password:', error);
        this.alertService.showAlert(
          'Failed to change password. Please try again.'
        );
      })
      .finally(() => {
        this.isSubmitting = false; // Reset isSubmitting to false after request completes
      });
  }

  onClose(): void {
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
    this.close.emit();
  }
}
