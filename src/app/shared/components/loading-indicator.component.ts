import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="loading-container"
      [class.full-page]="fullPage"
      [class.passive]="type === 'passive'"
      [class.active]="type === 'active'"
      role="alert"
      aria-live="polite"
    >
      <div
        class="loading-content"
        [class.with-progress]="progress !== undefined"
      >
        <div class="spinner" aria-hidden="true"></div>

        <div class="loading-text">
          {{ message || defaultMessage }}

          <div
            *ngIf="progress !== undefined"
            class="progress-container"
            role="progressbar"
            [attr.aria-valuenow]="progress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progress"></div>
            </div>
            <span class="progress-text">{{ progress }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .loading-container.passive {
        background: rgba(255, 255, 255, 0.7);
      }

      .loading-container.active {
        background: rgba(255, 255, 255, 0.95);
      }

      .loading-container.full-page {
        position: fixed;
      }

      .loading-content {
        text-align: center;
        padding: 2rem;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      .progress-container {
        margin-top: 1rem;
      }

      .progress-bar {
        height: 4px;
        background: #e2e8f0;
        border-radius: 2px;
        overflow: hidden;
        margin: 0.5rem 0;
      }

      .progress-fill {
        height: 100%;
        background: #2563eb;
        transition: width 0.3s ease;
      }

      .progress-text {
        font-size: 0.875rem;
        color: #64748b;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingIndicatorComponent {
  @Input() fullPage = false;
  @Input() type: 'passive' | 'active' = 'passive';
  @Input() message?: string;
  @Input() defaultMessage = 'Loading...';
  @Input() progress?: number;
}
