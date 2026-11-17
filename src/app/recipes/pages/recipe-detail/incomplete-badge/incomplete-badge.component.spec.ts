import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncompleteBadgeComponent } from './incomplete-badge.component';

describe('IncompleteBadgeComponent', () => {
  let fixture: ComponentFixture<IncompleteBadgeComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  const badge = () => el().querySelector<HTMLButtonElement>('.badge')!;
  const popover = () => el().querySelector('[role="dialog"]');

  beforeEach(() => {
    fixture = TestBed.createComponent(IncompleteBadgeComponent);
    fixture.componentRef.setInput('unknown', [
      { id: 'a', name: 'Tapioca starch' },
      { id: 'b', name: 'Mystery spice' },
    ]);
    fixture.detectChanges();
    document.body.appendChild(el());
  });

  afterEach(() => el().remove());

  function open() {
    badge().click();
    fixture.detectChanges();
  }

  it('is a button that opens a popover naming the unknown ingredients', () => {
    expect(badge().tagName).toBe('BUTTON');
    expect(badge().textContent!.trim()).toBe('Incomplete');
    expect(badge().getAttribute('aria-expanded')).toBe('false');
    open();
    expect(badge().getAttribute('aria-expanded')).toBe('true');
    expect(popover()!.querySelector('.text')!.textContent!.replace(/\s+/g, ' ').trim()).toBe(
      'Incomplete: no oxalate value for Tapioca starch, Mystery spice. The real total is higher.'
    );
    const links = Array.from(popover()!.querySelectorAll('a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#ing-a', '#ing-b']);
  });

  it('a name closes the popover and asks to show that row', () => {
    const picked: string[] = [];
    fixture.componentInstance.goTo.subscribe((id) => picked.push(id));
    open();
    popover()!.querySelectorAll('a')[1].click();
    fixture.detectChanges();
    expect(picked).toEqual(['b']);
    expect(popover()).toBeNull();
  });

  it('Esc closes it and puts focus back on the badge', () => {
    open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(popover()).toBeNull();
    expect(document.activeElement).toBe(badge());
  });

  it('the close button and a click outside close it', () => {
    open();
    popover()!.querySelector<HTMLButtonElement>('.close')!.click();
    fixture.detectChanges();
    expect(popover()).toBeNull();

    open();
    document.body.click();
    fixture.detectChanges();
    expect(popover()).toBeNull();
  });
});
