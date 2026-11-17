import { Component, Input } from '@angular/core';

/** Level badge: a dot + the level's name, in the app's level colors. */
@Component({
  selector: 'app-level-pill',
  standalone: true,
  template: `<span class="pill" [attr.data-tone]="tone"
    ><span class="dot" aria-hidden="true"></span>{{ prefix }}{{ level }}</span
  >`,
  styles: `
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 10px;
      border: 1px solid var(--color-line);
      border-radius: 999px;
      color: var(--color-muted);
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.5;
      white-space: nowrap;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    [data-tone='very-low'] { background: var(--level-very-low-surface); border-color: var(--level-very-low-border); color: var(--level-very-low-text); }
    [data-tone='low'] { background: var(--level-low-surface); border-color: var(--level-low-border); color: var(--level-low-text); }
    [data-tone='medium'] { background: var(--level-medium-surface); border-color: var(--level-medium-border); color: var(--level-medium-text); }
    [data-tone='high'] { background: var(--level-high-surface); border-color: var(--level-high-border); color: var(--level-high-text); }
  `,
})
export class LevelPillComponent {
  @Input({ required: true }) level!: string;
  /** e.g. "At least " for incomplete recipes. */
  @Input() prefix = '';

  get tone(): string {
    switch (this.level.trim().toLowerCase()) {
      case 'very low':
        return 'very-low';
      case 'low':
        return 'low';
      case 'medium':
        return 'medium';
      case 'high':
      case 'very high':
      case 'extremely high':
        return 'high';
      default:
        return 'neutral';
    }
  }
}
