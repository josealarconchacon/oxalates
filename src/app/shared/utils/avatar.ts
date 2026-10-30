/** Shown wherever a person has no profile photo, or theirs can't be loaded. */
export const DEFAULT_AVATAR = 'assets/images/default-avatar.svg';

/**
 * (error) handler for profile images. A stored photo can fail to display: an
 * iPhone HEIC upload that browsers can't decode, a deleted file, an expired
 * link. Swap in the default avatar rather than leave a broken-image icon.
 */
export function showDefaultAvatar(event: Event): void {
  const image = event.target as HTMLImageElement;
  if (!image.src.endsWith(DEFAULT_AVATAR)) {
    image.src = DEFAULT_AVATAR;
  }
}
