const numeric = (v) => typeof v === "number" && Number.isFinite(v) ? v : null;
function median(values) {
  const nums = values.filter((v) => numeric(v) !== null).sort((a, b) => a - b);
  if (!nums.length) return null;
  const center = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[center] : (nums[center - 1] + nums[center]) / 2;
}
function readPoint(row, visualization) {
  switch (visualization) {
    case "inspiratory_peak": return numeric(row.maxInsFlow);
    case "score": return numeric(row.maxScore);
    case "ratio": return numeric(row.maxScoreRatio) === null
      ? null : 100 * row.maxScoreRatio;
    default: return numeric(row.maxExpFlow);
  }
}
// Retains group comparisons using actual values from /plataforms/statistics.
export function comparativeData(groups, patientId, visualization) {
  const current = (groups || []).find((g) => String(g.pacientId) === String(patientId));
  const cohort = (groups || []).filter((g) => String(g.pacientId) !== String(patientId));
  if (!current || !Array.isArray(current.maxFlowsPerSession)) return [];
  return [...current.maxFlowsPerSession]
    .sort((a, b) => Number(a.sessionNumber) - Number(b.sessionNumber))
    .map((row, index) => {
      const session = Number(row.sessionNumber) || index + 1;
      const others = cohort.map((g) => (g.maxFlowsPerSession || [])
        .find((r) => Number(r.sessionNumber) === session))
        .filter(Boolean).map((r) => readPoint(r, visualization));
      return {
        name: `Sessão ${session}`, value: readPoint(row, visualization),
        cohortMedian: median(others),
        cohortCount: others.filter((v) => v !== null).length,
        session
      };
    });
}
