import { shouldAnimateChart, CHART_ANIMATION_MS } from "./chartPresentation";

test("short charts animate; dense PPG/flow render immediately", () => {
  expect(shouldAnimateChart(10)).toBe(true);
  expect(shouldAnimateChart(366)).toBe(true);
  expect(shouldAnimateChart(500)).toBe(true);
  expect(shouldAnimateChart(501)).toBe(false);
  expect(shouldAnimateChart(1200)).toBe(false);
  expect(shouldAnimateChart(0)).toBe(false);
});
test("animation duration stays brief", () => {
  expect(CHART_ANIMATION_MS).toBeLessThanOrEqual(400);
});
