import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { HSLA, HSVA, RGBA } from 'ngx-color';
import {
  DEFAULT_BANNER_COLOR,
  colorToHex,
  presetColorNames,
  isDarkColor,
  presetColors,
} from '../../../shared/utils/color-utils';
import {
  DEFAULT_AVATAR,
  showDefaultAvatar,
} from '../../../shared/utils/avatar';

let nextId = 0;

/**
 * The Choose Color dialog for the profile cover. It only picks a color:
 * the profile page decides what Save does (stores it, updates the banner).
 */
@Component({
  selector: 'app-cover-color-dialog',
  templateUrl: './cover-color-dialog.component.html',
  styleUrls: ['./cover-color-dialog.component.css'],
  standalone: false,
})
export class CoverColorDialogComponent implements OnInit {
  /** The saved cover color; null means the theme default. */
  @Input() color: string | null = null;
  /** For the preview card: the person's photo and name, as on their profile. */
  @Input() avatarUrl: string | null | undefined = null;
  @Input() name = 'Username';
  /** Save was pressed, with the picked color. */
  @Output() saved = new EventEmitter<string>();
  /** Cancel, the close button, Esc or a backdrop click: nothing changes. */
  @Output() closed = new EventEmitter<void>();

  readonly presets = presetColors.map((value, i) => ({
    value,
    name: presetColorNames[i],
    // The check is white on dark swatches and ink-colored on pale ones.
    lightCheck: isDarkColor(value),
  }));
  readonly defaultAvatar = DEFAULT_AVATAR;
  readonly onAvatarError = showDefaultAvatar;
  private readonly uid = nextId++;
  readonly titleId = `cover-color-title-${this.uid}`;
  readonly customPanelId = `cover-color-custom-${this.uid}`;
  /** The custom picker panel is showing. */
  customOpen = false;
  selectedColor = DEFAULT_BANNER_COLOR;

  ngOnInit(): void {
    this.selectedColor = this.color ?? DEFAULT_BANNER_COLOR;
    // Start open only when the saved color isn't one of the presets.
    this.customOpen = !this.presets.some((p) => this.isSelected(p.value));
  }

  toggleCustom(): void {
    this.customOpen = !this.customOpen;
  }

  /**
   * The preview cover. The default swatch means "follow the theme", so it
   * shows the profile's own default cover (soft green, or dark green-grey in
   * dark mode) rather than the light swatch color.
   */
  get previewColor(): string | null {
    return this.isSelected(DEFAULT_BANNER_COLOR) ? null : this.selectedColor;
  }

  isSelected(value: string): boolean {
    return this.selectedColor.toUpperCase() === value.toUpperCase();
  }

  /**
   * Roving tabindex: Tab stops once in the group, on the checked swatch
   * (or the first one when a custom color is in use).
   */
  tabIndexFor(index: number): number {
    const checked = this.presets.findIndex((p) => this.isSelected(p.value));
    return index === (checked === -1 ? 0 : checked) ? 0 : -1;
  }

  /** Arrow keys move to the next/previous swatch and pick it, like radios. */
  onPresetKeydown(event: KeyboardEvent, index: number): void {
    const last = this.presets.length - 1;
    const next: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    const target = next[event.key];
    this.onColorSelect(this.presets[target].value);
    const group = (event.currentTarget as HTMLElement).parentElement;
    (group?.children[target] as HTMLElement | undefined)?.focus();
  }

  onColorSelect(color: string | HSLA | HSVA | RGBA): void {
    this.selectedColor =
      typeof color === 'string' ? color : colorToHex(color) || '#000000';
  }

  save(): void {
    this.saved.emit(this.selectedColor);
  }

  cancel(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancel();
  }

  onBackdropClick(event: MouseEvent): void {
    // Only a click on the dimmed area itself, not one inside the dialog.
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}
