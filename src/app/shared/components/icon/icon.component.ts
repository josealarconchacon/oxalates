import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconName =
  | 'leaf'
  | 'search'
  | 'calculator'
  | 'heart'
  | 'message-circle'
  | 'moon'
  | 'sun'
  | 'user'
  | 'bookmark'
  | 'log-out'
  | 'pencil'
  | 'arrow-right'
  | 'chevron-right'
  | 'chevron-down'
  | 'share-2'
  | 'download'
  | 'sunrise'
  | 'cookie'
  | 'plus'
  | 'utensils'
  | 'trash-2'
  | 'palette'
  | 'camera'
  | 'mail'
  | 'apple'
  | 'carrot'
  | 'wheat'
  | 'flask-round'
  | 'bean'
  | 'nut'
  | 'triangle-alert'
  | 'shield-check'
  | 'gem'
  | 'activity'
  | 'funnel'
  | 'droplet'
  | 'gauge'
  | 'clipboard-list'
  | 'users';

/**
 * One line-icon set for the app (Lucide paths, 24×24 grid).
 * Decorative only: put the accessible name on the button or link around it.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size"
      [attr.height]="size"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name) {
        @case ('leaf') {
          <svg:path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <svg:path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        }
        @case ('search') {
          <svg:circle cx="11" cy="11" r="8" />
          <svg:path d="m21 21-4.3-4.3" />
        }
        @case ('calculator') {
          <svg:rect width="16" height="20" x="4" y="2" rx="2" />
          <svg:path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
        }
        @case ('heart') {
          <svg:path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        }
        @case ('message-circle') {
          <svg:path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        }
        @case ('moon') {
          <svg:path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        }
        @case ('sun') {
          <svg:circle cx="12" cy="12" r="4" />
          <svg:path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        }
        @case ('user') {
          <svg:path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <svg:circle cx="12" cy="7" r="4" />
        }
        @case ('bookmark') {
          <svg:path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        }
        @case ('log-out') {
          <svg:path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        }
        @case ('pencil') {
          <svg:path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z" />
          <svg:path d="m15 5 4 4" />
        }
        @case ('arrow-right') {
          <svg:path d="M5 12h14M12 5l7 7-7 7" />
        }
        @case ('chevron-right') {
          <svg:path d="m9 18 6-6-6-6" />
        }
        @case ('chevron-down') {
          <svg:path d="m6 9 6 6 6-6" />
        }
        @case ('share-2') {
          <svg:circle cx="18" cy="5" r="3" />
          <svg:circle cx="6" cy="12" r="3" />
          <svg:circle cx="18" cy="19" r="3" />
          <svg:path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
        }
        @case ('download') {
          <svg:path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        }
        @case ('sunrise') {
          <svg:path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0" />
        }
        @case ('cookie') {
          <svg:path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <svg:path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01" />
        }
        @case ('utensils') {
          <svg:path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        }
        @case ('plus') {
          <svg:path d="M5 12h14M12 5v14" />
        }
        @case ('trash-2') {
          <svg:path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
        }
        @case ('palette') {
          <svg:circle cx="13.5" cy="6.5" r=".5" />
          <svg:circle cx="17.5" cy="10.5" r=".5" />
          <svg:circle cx="8.5" cy="7.5" r=".5" />
          <svg:circle cx="6.5" cy="12.5" r=".5" />
          <svg:path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        }
        @case ('camera') {
          <svg:path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <svg:circle cx="12" cy="13" r="3" />
        }
        @case ('mail') {
          <svg:rect width="20" height="16" x="2" y="4" rx="2" />
          <svg:path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        }
        @case ('apple') {
          <svg:path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
          <svg:path d="M10 2c1 .5 2 2 2 5" />
        }
        @case ('carrot') {
          <svg:path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46" />
          <svg:path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
          <svg:path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z" />
        }
        @case ('wheat') {
          <svg:path d="M2 22 16 8" />
          <svg:path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
          <svg:path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
          <svg:path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
          <svg:path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
          <svg:path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
          <svg:path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
          <svg:path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
        }
        @case ('flask-round') {
          <svg:path d="M10 2v6.292a7 7 0 1 0 4 0V2M5 15h14M8.5 2h7" />
        }
        @case ('bean') {
          <svg:path d="M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z" />
          <svg:path d="M5.341 10.62a4 4 0 1 0 5.279-5.28" />
        }
        @case ('nut') {
          <svg:path d="M12 4V2" />
          <svg:path d="M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4" />
          <svg:path d="M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.029-2-3-.5-2-4-4-8-4Z" />
        }
        @case ('triangle-alert') {
          <svg:path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <svg:path d="M12 9v4M12 17h.01" />
        }
        @case ('shield-check') {
          <svg:path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <svg:path d="m9 12 2 2 4-4" />
        }
        @case ('gem') {
          <svg:path d="M6 3h12l4 6-10 13L2 9Z" />
          <svg:path d="M11 3 8 9l4 13 4-13-3-6M2 9h20" />
        }
        @case ('activity') {
          <svg:path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
        }
        @case ('funnel') {
          <svg:path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        }
        @case ('droplet') {
          <svg:path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        }
        @case ('gauge') {
          <svg:path d="m12 14 4-4M3.34 19a10 10 0 1 1 17.32 0" />
        }
        @case ('clipboard-list') {
          <svg:rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <svg:path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01" />
        }
        @case ('users') {
          <svg:path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <svg:circle cx="9" cy="7" r="4" />
          <svg:path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
    }
    svg {
      fill: var(--icon-fill, none);
      stroke: currentColor;
      stroke-width: var(--icon-stroke, 1.8);
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 18;
}
