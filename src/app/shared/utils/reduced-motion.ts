/**
 * True when the visitor has asked their system to reduce motion.
 *
 * The global `prefers-reduced-motion` CSS rule only reaches CSS animations and
 * transitions. Angular's animations run through the Web Animations API, which
 * that rule can't touch (a 400ms dialog slide still played at 400ms with it
 * applied), so the app also turns Angular's animation engine off from here.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
