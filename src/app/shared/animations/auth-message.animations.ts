import {
  trigger,
  transition,
  style,
  animate,
  state,
  query,
  group,
} from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 })),
  ]),
]);

export const slideAnimation = trigger('slideAnimation', [
  transition(':increment', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        style({
          transform: 'translateX(100%)',
          opacity: 0,
        }),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [
        style({
          transform: 'translateX(0)',
          opacity: 1,
        }),
      ],
      { optional: true }
    ),
    group([
      query(
        ':leave',
        [
          animate(
            '600ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({
              transform: 'translateX(-100%)',
              opacity: 0,
            })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            '600ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({
              transform: 'translateX(0%)',
              opacity: 1,
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
  transition(':decrement', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        style({
          transform: 'translateX(-100%)',
          opacity: 0,
        }),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [
        style({
          transform: 'translateX(0)',
          opacity: 1,
        }),
      ],
      { optional: true }
    ),
    group([
      query(
        ':leave',
        [
          animate(
            '600ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({
              transform: 'translateX(100%)',
              opacity: 0,
            })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            '600ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({
              transform: 'translateX(0%)',
              opacity: 1,
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

export const contentAnimation = trigger('contentAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate(
      '400ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 1, transform: 'translateY(0)' })
    ),
  ]),
]);

export const indicatorPulse = trigger('indicatorPulse', [
  state('true', style({ transform: 'scale(1.2)' })),
  state('false', style({ transform: 'scale(1)' })),
  transition('false => true', animate('300ms ease-out')),
  transition('true => false', animate('300ms ease-in')),
]);
