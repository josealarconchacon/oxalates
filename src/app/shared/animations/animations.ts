import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

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

export const dialogAnimation = trigger('dialogAnimation', [
  state(
    'void',
    style({
      opacity: 0,
      transform: 'scale(0.98) translate3d(0, 15px, 0)',
    })
  ),
  transition(':enter', [
    animate(
      '400ms cubic-bezier(0.21, 1.02, 0.73, 1)',
      keyframes([
        style({
          opacity: 0,
          transform: 'scale(0.98) translate3d(0, 15px, 0)',
          offset: 0,
        }),
        style({
          opacity: 0.5,
          transform: 'scale(0.99) translate3d(0, 8px, 0)',
          offset: 0.4,
        }),
        style({
          opacity: 0.8,
          transform: 'scale(0.995) translate3d(0, 3px, 0)',
          offset: 0.7,
        }),
        style({
          opacity: 1,
          transform: 'scale(1) translate3d(0, 0, 0)',
          offset: 1,
        }),
      ])
    ),
  ]),
  transition(':leave', [
    animate(
      '300ms cubic-bezier(0.35, 0.15, 0.3, 1)',
      keyframes([
        style({
          opacity: 1,
          transform: 'scale(1) translate3d(0, 0, 0)',
          offset: 0,
        }),
        style({
          opacity: 0.6,
          transform: 'scale(0.995) translate3d(0, 5px, 0)',
          offset: 0.5,
        }),
        style({
          opacity: 0,
          transform: 'scale(0.98) translate3d(0, 15px, 0)',
          offset: 1,
        }),
      ])
    ),
  ]),
]);
