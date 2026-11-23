import { comparativeData } from "./comparativeData";

const groups = [
  { pacientId: "patient-a", maxFlowsPerSession: [
    { sessionNumber: 1, maxExpFlow: 245, maxInsFlow: -100,
      maxScore: 100, maxScoreRatio: .8 },
    { sessionNumber: 2, maxExpFlow: 260, maxScore: 110 }
  ] },
  { pacientId: "patient-b", maxFlowsPerSession: [
    { sessionNumber: 1, maxExpFlow: 230, maxScoreRatio: .6 }
  ] },
  { pacientId: "patient-c", maxFlowsPerSession: [
    { sessionNumber: 1, maxExpFlow: 250, maxScoreRatio: .7 }
  ] }
];
test("compares selected patient with real cohort median", () => {
  const rows = comparativeData(groups, "patient-a", "expiratory_peak");
  expect(rows).toHaveLength(2);
  expect(rows[0].value).toBe(245);
  expect(rows[0].cohortMedian).toBe(240);
  expect(rows[1].cohortMedian).toBeNull();
});
test("ratio is converted from fractional value to percentage", () => {
  const rows = comparativeData(groups, "patient-a", "ratio");
  expect(rows[0].value).toBe(80);
  expect(rows[0].cohortMedian).toBe(65);
});
test("returns empty when selected patient is not in the authorized cohort", () => {
  expect(comparativeData(groups, "other", "expiratory_peak")).toEqual([]);
});
