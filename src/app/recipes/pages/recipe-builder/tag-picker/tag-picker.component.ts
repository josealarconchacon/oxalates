import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';

export const SUGGESTED_TAGS = [
  'Low histamine',
  'Gluten-free',
  'Dairy-free',
  'Low FODMAP',
  'Drink/Smoothie',
  'Holiday',
];
export const MAX_TAGS = 8;
export const MAX_TAG_LENGTH = 24;

let nextId = 0;

/**
 * The user's own labels for a recipe: removable chips + "Add tag" (a small
 * menu of suggestions and a custom tag). Neutral chips, never level colors.
 */
@Component({
  selector: 'app-tag-picker',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './tag-picker.component.html',
  styleUrl: './tag-picker.component.css',
})
export class TagPickerComponent {
  private host = inject(ElementRef<HTMLElement>);

  @Input() tags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();
  @ViewChild('addButton') private addButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('customInput') private customInput?: ElementRef<HTMLInputElement>;

  readonly id = `tags-${nextId++}`;
  readonly maxTags = MAX_TAGS;
  readonly maxLength = MAX_TAG_LENGTH;
  open = false;
  custom = '';
  error: string | null = null;

  get full(): boolean {
    return this.tags.length >= MAX_TAGS;
  }

  /** Suggestions not already on the recipe. */
  get suggestions(): string[] {
    return SUGGESTED_TAGS.filter((s) => !this.has(s));
  }

  toggle(): void {
    this.open ? this.close() : this.openMenu();
  }

  openMenu(): void {
    this.open = true;
    this.custom = '';
    this.error = null;
    setTimeout(() => {
      const first = this.host.nativeElement.querySelector('.menu button, .menu input') as HTMLElement | null;
      first?.focus();
    });
  }

  close(returnFocus = true): void {
    this.open = false;
    this.error = null;
    if (returnFocus) setTimeout(() => this.addButton?.nativeElement.focus());
  }

  add(raw: string): void {
    const tag = raw.trim().replace(/\s+/g, ' ');
    if (!tag) {
      this.error = 'Type a tag first.';
    } else if (tag.length > MAX_TAG_LENGTH) {
      this.error = `Use ${MAX_TAG_LENGTH} characters or fewer.`;
    } else if (this.has(tag)) {
      this.error = 'That tag is already on this recipe.';
    } else if (this.full) {
      this.error = `You can add up to ${MAX_TAGS} tags.`;
    } else {
      this.tagsChange.emit([...this.tags, tag]);
      this.close();
      return;
    }
    this.customInput?.nativeElement.focus();
  }

  remove(index: number): void {
    const next = this.tags.filter((_, i) => i !== index);
    this.tagsChange.emit(next);
    // Focus the chip that took its place, or "Add tag".
    setTimeout(() => {
      const removes = this.host.nativeElement.querySelectorAll('.chip-remove') as NodeListOf<HTMLElement>;
      (removes[Math.min(index, removes.length - 1)] ?? this.addButton?.nativeElement)?.focus();
    });
  }

  onCustomKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // don't submit the recipe form
      this.add(this.custom);
    }
  }

  @HostListener('keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!this.open) return;
    event.stopPropagation();
    this.close();
  }

  /** A click anywhere else closes the menu. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }

  private has(tag: string): boolean {
    return this.tags.some((t) => t.toLowerCase() === tag.trim().toLowerCase());
  }
}
