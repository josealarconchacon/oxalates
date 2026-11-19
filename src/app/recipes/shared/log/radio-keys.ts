/**
 * Arrow keys (and Home/End) move the choice within a radiogroup, and focus
 * follows at once. The radios are the same elements before and after, so
 * focus can move immediately (a timer lets quick repeated presses act on the old radio).
 */
export function onRadioKey<T>(event: KeyboardEvent, values: T[], current: T, select: (value: T) => void): void {
  const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[event.key];
  const edge = ({ Home: 0, End: values.length - 1 } as Record<string, number>)[event.key];
  if (step === undefined && edge === undefined) return;
  event.preventDefault();
  const index = edge ?? (values.indexOf(current) + step + values.length) % values.length;
  select(values[index]);
  const group = (event.currentTarget as HTMLElement).closest('[role="radiogroup"]');
  group?.querySelectorAll<HTMLElement>('[role="radio"]')[index]?.focus();
}
