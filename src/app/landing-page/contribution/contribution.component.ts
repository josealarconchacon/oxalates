import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contribution',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contribution.component.html',
  styleUrls: ['./contribution.component.css'],
})
export class ContributionComponent {
  currentStep = 1;
  verificationCode = '123456';
  showModal = false;
  selectedPaymentMethod: 'venmo' | 'paypal' | null = null;

  setStep(step: number): void {
    this.currentStep = step;
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.verificationCode);
  }

  openPaymentModal(method: 'venmo' | 'paypal'): void {
    this.selectedPaymentMethod = method;
    this.showModal = true;
  }

  getQRCodeSource(): string {
    return this.selectedPaymentMethod === 'venmo'
      ? '../../../assets/app-logo/IMG_0860 2.jpg'
      : '../../../assets/app-logo/IMG_0861.jpg';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPaymentMethod = null;
  }
}
