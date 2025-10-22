import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HapticService {
  private vibrationSupported: boolean = false;

  constructor() {
    this.vibrationSupported = 'vibrate' in navigator;
  }

  /**
   * Light haptic feedback for subtle interactions
   * (e.g., button taps, toggle switches)
   */
  light(): void {
    if (this.vibrationSupported) {
      navigator.vibrate(10);
    }
  }

  /**
   * Medium haptic feedback for standard interactions
   * (e.g., selection changes, notifications)
   */
  medium(): void {
    if (this.vibrationSupported) {
      navigator.vibrate(20);
    }
  }

  /**
   * Heavy haptic feedback for important actions
   * (e.g., errors, confirmations, deletions)
   */
  heavy(): void {
    if (this.vibrationSupported) {
      navigator.vibrate(30);
    }
  }

  /**
   * Success pattern - double tap feel
   */
  success(): void {
    if (this.vibrationSupported) {
      navigator.vibrate([10, 50, 10]);
    }
  }

  /**
   * Error pattern - triple tap feel
   */
  error(): void {
    if (this.vibrationSupported) {
      navigator.vibrate([10, 30, 10, 30, 10]);
    }
  }

  /**
   * Warning pattern - sustained vibration
   */
  warning(): void {
    if (this.vibrationSupported) {
      navigator.vibrate(40);
    }
  }

  /**
   * Selection pattern - quick tap
   */
  selection(): void {
    if (this.vibrationSupported) {
      navigator.vibrate(5);
    }
  }

  /**
   * Impact pattern - strong single tap
   */
  impact(): void {
    if (this.vibrationSupported) {
      navigator.vibrate(25);
    }
  }

  /**
   * Custom vibration pattern
   * @param pattern Array of vibration durations and pauses [vibrate, pause, vibrate, pause, ...]
   */
  custom(pattern: number[]): void {
    if (this.vibrationSupported) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Stop any ongoing vibration
   */
  stop(): void {
    if (this.vibrationSupported) {
      navigator.vibrate(0);
    }
  }

  /**
   * Check if haptic feedback is supported
   */
  isSupported(): boolean {
    return this.vibrationSupported;
  }
}
