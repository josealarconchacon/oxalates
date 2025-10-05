import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContributionComponent } from './contribution.component';

describe('ContributionComponent', () => {
  let component: ContributionComponent;
  let fixture: ComponentFixture<ContributionComponent>;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    consoleErrorSpy = spyOn(console, 'error');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentStep).toBe(1);
    expect(component.verificationCode).toBe(mockTestCode);
    expect(component.showModal).toBeFalse();
    expect(component.selectedPaymentMethod).toBeNull();
  });

  it('should have correct payment method paths', () => {
    expect(component.paymentMethods.venmo).toBe(mockIMG_0860_2);
    expect(component.paymentMethods.paypal).toBe(mockIMG_0861);
    expect(component.paymentMethods.cashapp).toBe(mockIMG_0962);
  });

  describe('setStep', () => {
    it('should update current step', () => {
      component.setStep(2);
      expect(component.currentStep).toBe(2);

      component.setStep(3);
      expect(component.currentStep).toBe(3);

      component.setStep(1);
      expect(component.currentStep).toBe(1);
    });
  });

  describe('copyCode', () => {
    it('should copy verification code to clipboard', async () => {
      const clipboardSpy = spyOn(
        navigator.clipboard,
        'writeText'
      ).and.returnValue(Promise.resolve());

      component.copyCode();

      expect(clipboardSpy).toHaveBeenCalledWith(mockTestCode);
    });

    it('should log error when clipboard copy fails', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(
        Promise.reject('Clipboard error')
      );

      await component.copyCode();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy verification code to clipboard'
      );
    });
  });

  describe('openPaymentModal', () => {
    it('should open modal with venmo payment method', () => {
      component.openPaymentModal('venmo');

      expect(component.selectedPaymentMethod).toBe('venmo');
      expect(component.showModal).toBeTrue();
    });

    it('should open modal with paypal payment method', () => {
      component.openPaymentModal('paypal');

      expect(component.selectedPaymentMethod).toBe('paypal');
      expect(component.showModal).toBeTrue();
    });

    it('should open modal with cashapp payment method', () => {
      component.openPaymentModal('cashapp');

      expect(component.selectedPaymentMethod).toBe('cashapp');
      expect(component.showModal).toBeTrue();
    });
  });

  describe('getQRCodeSource', () => {
    it('should return empty string when no payment method selected', () => {
      component.selectedPaymentMethod = null;

      expect(component.getQRCodeSource()).toBe('');
    });

    it('should return venmo QR code path', () => {
      component.selectedPaymentMethod = 'venmo';

      expect(component.getQRCodeSource()).toBe(
        '../../../assets/app-logo/IMG_0860 2.jpg'
      );
    });

    it('should return paypal QR code path', () => {
      component.selectedPaymentMethod = 'paypal';
      expect(component.getQRCodeSource()).toBe(mockIMG_0861);
    });

    it('should return cashapp QR code path', () => {
      component.selectedPaymentMethod = 'cashapp';
      expect(component.getQRCodeSource()).toBe(mockIMG_0962);
    });
  });

  describe('closeModal', () => {
    it('should close modal and reset payment method', () => {
      component.showModal = true;
      component.selectedPaymentMethod = 'venmo';
      component.closeModal();
      expect(component.showModal).toBeFalse();
      expect(component.selectedPaymentMethod).toBeNull();
    });

    it('should work when modal is already closed', () => {
      component.showModal = false;
      component.selectedPaymentMethod = null;
      expect(() => component.closeModal()).not.toThrow();
      expect(component.showModal).toBeFalse();
      expect(component.selectedPaymentMethod).toBeNull();
    });
  });

  describe('integration scenarios', () => {
    it('should handle full payment flow', () => {
      component.openPaymentModal('venmo');
      expect(component.showModal).toBeTrue();
      expect(component.getQRCodeSource()).toBe(mockIMG_0860);
      component.closeModal();
      expect(component.showModal).toBeFalse();
      expect(component.getQRCodeSource()).toBe('');
    });

    it('should switch between payment methods', () => {
      component.openPaymentModal('venmo');
      expect(component.selectedPaymentMethod).toBe('venmo');
      component.openPaymentModal('paypal');
      expect(component.selectedPaymentMethod).toBe('paypal');
      component.openPaymentModal('cashapp');
      expect(component.selectedPaymentMethod).toBe('cashapp');
    });
  });
});

const mockTestCode = '123456';
const mockIMG_0860 = '../../../assets/app-logo/IMG_0860 2.jpg';
const mockIMG_0962 = '../../../assets/app-logo/IMG_0962.png';
const mockIMG_0861 = '../../../assets/app-logo/IMG_0861.jpg';
const mockIMG_0860_2 = '../../../assets/app-logo/IMG_0860 2.jpg';
