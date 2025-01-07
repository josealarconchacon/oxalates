import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const menuAnimation = trigger('menuAnimation', [
  state(
    'hide',
    style({
      opacity: 0,
      transform: 'scale(0.95)',
      pointerEvents: 'none',
    })
  ),
  state(
    'show',
    style({
      opacity: 1,
      transform: 'scale(1)',
      pointerEvents: 'auto',
    })
  ),
  transition('hide => show', [animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')]),
  transition('show => hide', [animate('150ms cubic-bezier(0.4, 0, 0.2, 1)')]),
]);

export const slideIn = trigger('slideIn', [
  state(
    'false',
    style({
      opacity: 0,
      transform: 'translateX(1rem)',
    })
  ),
  state(
    'true',
    style({
      opacity: 1,
      transform: 'translateX(0)',
    })
  ),
  transition('false => true', [
    animate('200ms ease', style({ opacity: 0, transform: 'translateX(1rem)' })),
    animate('{{delay}}ms', style({ opacity: 0 })),
    animate('200ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
  transition('true => false', [
    animate('150ms ease', style({ opacity: 0, transform: 'translateX(1rem)' })),
  ]),
]);
