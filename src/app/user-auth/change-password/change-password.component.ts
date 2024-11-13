import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth-service.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  isSubmitting = false; // Add the isSubmitting property

  @Output() close = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
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
        alert('Password changed successfully!');
        this.passwordForm.reset();
        this.close.emit();
      })
      .catch((error) => {
        console.error('Error changing password:', error);
        alert('Failed to change password. Please try again.');
      })
      .finally(() => {
        this.isSubmitting = false; // Reset isSubmitting to false after request completes
      });
  }

  onClose(): void {
    this.close.emit();
  }
}
