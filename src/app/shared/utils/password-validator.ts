import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function isStrongPassword(password: string): boolean {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

// Reactive-forms wrapper around isStrongPassword. Leaves empty values to
// Validators.required so the two error states stay distinguishable.
export const strongPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }
  return isStrongPassword(control.value) ? null : { weakPassword: true };
};
