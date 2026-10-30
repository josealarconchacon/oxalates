import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogDirective } from './dialog.directive';

@Component({
  standalone: true,
  imports: [DialogDirective, NgIf],
  template: `
    <button id="opener" type="button" (click)="open = true">Open</button>
    <button id="outside" type="button">Outside</button>
    <div
      *ngIf="open"
      id="box"
      appDialog
      aria-label="Test dialog"
      (dialogClose)="closed = closed + 1; open = false"
    >
      <button id="first" type="button">First</button>
      <button id="middle" type="button">Middle</button>
      <button
        id="last"
        type="button"
        [attr.data-autofocus]="autofocusLast ? '' : null"
      >
        Last
      </button>
    </div>
  `,
})
class HostComponent {
  open = false;
  closed = 0;
  autofocusLast = false;
}

describe('DialogDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const q = (sel: string) =>
    fixture.nativeElement.querySelector(sel) as HTMLElement;

  const openDialog = () => {
    q('#opener').focus();
    q('#opener').click();
    fixture.detectChanges();
  };

  const press = (target: HTMLElement, key: string, shiftKey = false) => {
    const event = new KeyboardEvent('keydown', {
      key,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    // Focus and visibility only behave realistically when attached to the page.
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it('adds dialog semantics to its host', () => {
    openDialog();
    const box = q('#box');
    expect(box.getAttribute('role')).toBe('dialog');
    expect(box.getAttribute('aria-modal')).toBe('true');
    expect(box.getAttribute('tabindex')).toBe('-1');
  });

  it('moves focus to the first focusable element when it opens', () => {
    openDialog();
    expect(document.activeElement).toBe(q('#first'));
  });

  it('prefers an element marked data-autofocus', () => {
    host.autofocusLast = true;
    openDialog();
    expect(document.activeElement).toBe(q('#last'));
  });

  it('wraps Tab from the last element to the first', () => {
    openDialog();
    q('#last').focus();
    const event = press(q('#last'), 'Tab');
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(q('#first'));
  });

  it('wraps Shift+Tab from the first element to the last', () => {
    openDialog();
    q('#first').focus();
    const event = press(q('#first'), 'Tab', true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(q('#last'));
  });

  it('leaves Tab alone in the middle of the dialog', () => {
    openDialog();
    q('#middle').focus();
    const event = press(q('#middle'), 'Tab');
    expect(event.defaultPrevented).toBe(false);
  });

  it('emits dialogClose on Escape and closes', () => {
    openDialog();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    fixture.detectChanges();
    expect(host.closed).toBe(1);
    expect(q('#box')).toBeNull();
  });

  it('returns focus to the opener when it closes', () => {
    openDialog();
    expect(document.activeElement).toBe(q('#first'));
    host.open = false;
    fixture.detectChanges();
    expect(document.activeElement).toBe(q('#opener'));
  });

  it('pulls focus back inside if it lands outside while open', () => {
    openDialog();
    q('#outside').focus();
    expect(q('#box').contains(document.activeElement)).toBe(true);
  });
});
