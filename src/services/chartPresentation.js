// Keep the short animation seen in legacy charts for small datasets only.
// Dense raw waveforms are drawn immediately to keep interaction responsive.
export function shouldAnimateChart(pointCount) {
  return Number.isFinite(pointCount) && pointCount > 0 && pointCount <= 500;
}
export const CHART_ANIMATION_MS = 320;
