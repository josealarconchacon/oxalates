/** Display only; the math is never rounded. */
export function formatMg(mg: number): string {
  return (Math.round(mg * 10) / 10).toFixed(1);
}

export function formatShare(percent: number): string {
  return `${Math.round(percent)}%`;
}
