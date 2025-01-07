import { animate, style, transition, trigger } from '@angular/animations';

export const slideInAnimation = trigger('slideInAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate(
      '500ms ease-out',
      style({ transform: 'translateX(0)', opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate(
      '500ms ease-in',
      style({ transform: 'translateX(100%)', opacity: 0 })
    ),
  ]),
]);
