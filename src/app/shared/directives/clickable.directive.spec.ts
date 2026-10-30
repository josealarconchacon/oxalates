import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClickableDirective } from './clickable.directive';

@Component({
  standalone: true,
  imports: [ClickableDirective],
  template: `
    <div class="plain" appClickable (click)="clicks = clicks + 1">Open</div>

    <!-- The profile avatar: a label for a hidden file input -->
    <input id="avatar-file" type="file" hidden />
    <label
      class="avatar-label"
      for="avatar-file"
      appClickable
      aria-label="Change profile photo"
    ></label>
  `,
})
class HostComponent {
  clicks = 0;
}

describe('ClickableDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let root: HTMLElement;

  const press = (el: HTMLElement, key: string): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [HostComponent],
    }).createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('gives the element button semantics and a tab stop', () => {
    const el = root.querySelector('.plain')!;

    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
  });

  it('runs the click handler on Enter and on Space', () => {
    const el = root.querySelector<HTMLElement>('.plain')!;

    press(el, 'Enter');
    press(el, ' ');

    expect(host.clicks).toBe(2);
  });

  it('prevents the default action so Space does not scroll the page', () => {
    const el = root.querySelector<HTMLElement>('.plain')!;

    expect(press(el, 'Enter').defaultPrevented).toBeTrue();
    expect(press(el, ' ').defaultPrevented).toBeTrue();
  });

  it('ignores other keys', () => {
    const el = root.querySelector<HTMLElement>('.plain')!;

    press(el, 'a');
    press(el, 'Tab');

    expect(host.clicks).toBe(0);
  });

  describe('as the avatar upload label', () => {
    let label: HTMLElement;
    let fileInput: HTMLInputElement;
    let inputClicks: number;

    beforeEach(() => {
      label = root.querySelector<HTMLElement>('.avatar-label')!;
      fileInput = root.querySelector<HTMLInputElement>('#avatar-file')!;
      inputClicks = 0;
      // Stop the real file picker opening; only count the activation.
      fileInput.addEventListener('click', (event) => {
        inputClicks++;
        event.preventDefault();
      });
    });

    it('is a named button that can be reached with Tab', () => {
      expect(label.getAttribute('role')).toBe('button');
      expect(label.getAttribute('tabindex')).toBe('0');
      expect(label.getAttribute('aria-label')).toBe('Change profile photo');
    });

    it('opens the file input on Enter', () => {
      press(label, 'Enter');

      expect(inputClicks).toBe(1);
    });

    it('opens the file input on Space', () => {
      press(label, ' ');

      expect(inputClicks).toBe(1);
    });
  });
});
