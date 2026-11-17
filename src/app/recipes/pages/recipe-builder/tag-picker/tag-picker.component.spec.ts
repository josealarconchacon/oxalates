import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAX_TAGS, SUGGESTED_TAGS, TagPickerComponent } from './tag-picker.component';

describe('TagPickerComponent', () => {
  let fixture: ComponentFixture<TagPickerComponent>;
  let emitted: string[][];
  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => el().querySelector<HTMLButtonElement>('.chip--add');
  const text = () => el().textContent!.replace(/\s+/g, ' ');

  function setup(tags: string[]) {
    fixture = TestBed.createComponent(TagPickerComponent);
    emitted = [];
    fixture.componentInstance.tagsChange.subscribe((t) => {
      emitted.push(t);
      fixture.componentRef.setInput('tags', t);
    });
    fixture.componentRef.setInput('tags', tags);
    fixture.detectChanges();
  }

  function open() {
    addButton()!.click();
    fixture.detectChanges();
    tick();
  }

  function typeCustom(value: string) {
    const input = el().querySelector<HTMLInputElement>('.custom-input')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return input;
  }

  it('shows each tag as a chip with a labelled remove button, and the helper text', () => {
    setup(['Gluten-free', 'Dairy-free']);
    const removes = [...el().querySelectorAll('.chip-remove')].map((b) => b.getAttribute('aria-label'));
    expect(removes).toEqual(['Remove tag Gluten-free', 'Remove tag Dairy-free']);
    expect(text()).toContain("Tags are your own labels. We don't check them.");
  });

  it('"Add tag" opens a menu of suggestions not already used', fakeAsync(() => {
    setup(['Gluten-free']);
    open();
    expect(addButton()!.getAttribute('aria-expanded')).toBe('true');
    const options = [...el().querySelectorAll('.option')].map((o) => o.textContent!.trim());
    expect(options).toEqual(SUGGESTED_TAGS.filter((t) => t !== 'Gluten-free'));
  }));

  it('picking a suggestion adds it and closes the menu', fakeAsync(() => {
    setup([]);
    open();
    (el().querySelector('.option') as HTMLElement).click();
    fixture.detectChanges();
    tick();
    expect(emitted.at(-1)).toEqual(['Low histamine']);
    expect(el().querySelector('.menu')).toBeNull();
  }));

  it('a custom tag: trimmed, Enter adds without submitting the form', fakeAsync(() => {
    setup([]);
    open();
    const input = typeCustom('  Kid   friendly ');
    const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    input.dispatchEvent(enter);
    tick();
    expect(enter.defaultPrevented).toBeTrue();
    expect(emitted.at(-1)).toEqual(['Kid friendly']);
  }));

  it('no duplicates (any case), nothing empty, at most 24 characters', fakeAsync(() => {
    setup(['Holiday']);
    open();
    typeCustom('holiday');
    el().querySelector<HTMLButtonElement>('.custom-add')!.click();
    fixture.detectChanges();
    expect(el().querySelector('.error')!.textContent).toBe('That tag is already on this recipe.');
    typeCustom('   ');
    el().querySelector<HTMLButtonElement>('.custom-add')!.click();
    fixture.detectChanges();
    expect(el().querySelector('.error')!.textContent).toBe('Type a tag first.');
    expect(el().querySelector('.custom-input')!.getAttribute('maxlength')).toBe('24');
    expect(emitted.length).toBe(0);
  }));

  it(`at ${MAX_TAGS} tags "Add tag" goes away and the helper says why`, () => {
    setup(['1', '2', '3', '4', '5', '6', '7', '8']);
    expect(addButton()).toBeNull();
    expect(text()).toContain('You can add up to 8.');
  });

  it('removing a tag moves focus to the next chip', fakeAsync(() => {
    setup(['A', 'B', 'C']);
    el().querySelectorAll<HTMLButtonElement>('.chip-remove')[1].click();
    fixture.detectChanges();
    tick();
    expect(emitted.at(-1)).toEqual(['A', 'C']);
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove tag C');
  }));

  it('Esc closes the menu and returns focus to "Add tag"', fakeAsync(() => {
    setup([]);
    open();
    el().querySelector('.menu')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    tick();
    expect(el().querySelector('.menu')).toBeNull();
    expect(document.activeElement).toBe(addButton());
  }));
});
