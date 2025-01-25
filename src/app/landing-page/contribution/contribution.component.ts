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
  selectedPaymentMethod: 'venmo' | 'paypal' | 'cashapp' | null = null;

  paymentMethods: {
    [key in 'venmo' | 'paypal' | 'cashapp']: string;
  } = {
    venmo: '../../../assets/app-logo/IMG_0860 2.jpg',
    paypal: '../../../assets/app-logo/IMG_0861.jpg',
    cashapp: '../../../assets/app-logo/IMG_0962.png',
  };

  setStep(step: number): void {
    this.currentStep = step;
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.verificationCode).catch(() => {
      console.error('Failed to copy verification code to clipboard');
    });
  }

  openPaymentModal(method: 'venmo' | 'paypal' | 'cashapp'): void {
    this.selectedPaymentMethod = method;
    this.showModal = true;
  }

  getQRCodeSource(): string {
    if (!this.selectedPaymentMethod) {
      return '';
    }

    return this.paymentMethods[this.selectedPaymentMethod];
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPaymentMethod = null;
  }
}
