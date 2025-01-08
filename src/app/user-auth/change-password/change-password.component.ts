import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth-service.service';
import { AlertService } from 'src/app/shared/alert-service/alert.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  isSubmitting = false;
  showAlert: boolean = false;
  alertMessage: string = '';

  @Output() close = new EventEmitter<void>();

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
    this.close.emit();
  }
}
