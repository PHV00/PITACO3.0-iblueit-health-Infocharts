// Pure adaptations for charts. All filters are presentation-only: Atlas is unchanged.
const num = (v) => typeof v === "number" && Number.isFinite(v) ? v : null;

export function pitaco3Device(document) {
  return (document && Array.isArray(document.flowDataDevices)
    ? document.flowDataDevices : []).find((d) => d.deviceName === "Pitaco 3.0") || null;
}
function seconds(sample, origin, zero) {
  const date = Date.parse(sample.timestamp);
  if (Number.isFinite(date) && Number.isFinite(origin)) return (date - origin) / 1000;
  if (num(sample.deviceTimeMs) !== null) return (sample.deviceTimeMs - zero) / 1000;
  return null;
}
function points(samples, session, fieldNames, accepted) {
  if (!Array.isArray(samples)) return [];
  const start = Date.parse(session.playStart);
  const zero = (samples.find((s) => num(s.deviceTimeMs) !== null) || {}).deviceTimeMs || 0;
  return samples.map((s, index) => {
    const good = !accepted || accepted(s);
    const mapped = { t: seconds(s, start, zero), seq: s.seq || index };
    fieldNames.forEach((key) => { mapped[key] = good ? num(s[key]) : null; });
    return mapped;
  }).filter((x) => x.t !== null);
}
export function buildSignalSeries(document, stage, onlyApproved = false) {
  const device = pitaco3Device(document);
  if (!device) return { flow: [], bpm: [], spo2: [], ppg: [], rawCount: 0 };
  const ok = (s) => s.contactConfirmed === true && s.g1Approved === true;
  const validBpm = (s) => !onlyApproved || ok(s);
  const validSpo2 = (s) => !onlyApproved ||
    (ok(s) && s.isDemonstration === true);
  // In raw PPG, there is no g1Approved: require contact and no recorded SQI reason.
  const validRaw = (s) => !onlyApproved ||
    (s.contact === true && s.sqiReason === 0);
  const ppg = points(device.ppgRawData, stage, ["red", "ir"], validRaw);
  return {
    flow: decimate(points(device.flowData, stage, ["flowValue"]), 1200, ["flowValue"]),
    bpm: points(device.bpmData, stage, ["bpm"], validBpm),
    spo2: points(device.spo2Data, stage, ["spo2Percent"], validSpo2),
    ppg: decimate(ppg, 1200, ["red", "ir"]),
    rawCount: ppg.length
  };
}
/**
 * Min/max bucket decimation for visualisation only; the source remains unmodified.
 * Preserve endpoints, extrema and at least one invalid sample per bucket so that
 * null gaps do not silently become valid continuous traces.
 */
export function decimate(rows, target = 1200, fields) {
  if (!Array.isArray(rows) || rows.length <= target || target < 10) return rows;
  const keys = (fields && fields.length ? fields : Object.keys(rows[0] || {})
    .filter((key) => key !== "t" && key !== "seq"));
  if (!keys.length) {
    const step = Math.ceil(rows.length / Math.max(target - 1, 1));
    const out = rows.filter((_, index) => index % step === 0);
    if (out[out.length - 1] !== rows[rows.length - 1]) out.push(rows[rows.length - 1]);
    return out;
  }
  const perBucket = 3 + 2 * keys.length; // first, last, first invalid, extrema by series
  const buckets = Math.max(1, Math.floor((target - 2) / perBucket));
  const selected = new Set([0, rows.length - 1]);
  const interior = rows.length - 2;
  for (let bucket = 0; bucket < buckets; bucket++) {
    const start = 1 + Math.floor(bucket * interior / buckets);
    const end = 1 + Math.floor((bucket + 1) * interior / buckets);
    if (start >= end) continue;
    selected.add(start); selected.add(end - 1);
    for (const key of keys) {
      let low = Infinity, high = -Infinity, lowIndex = -1, highIndex = -1;
      for (let i = start; i < end; i++) {
        const value = rows[i][key];
        if (typeof value !== "number" || !Number.isFinite(value)) continue;
        if (value < low) { low = value; lowIndex = i; }
        if (value > high) { high = value; highIndex = i; }
      }
      if (lowIndex !== -1) selected.add(lowIndex);
      if (highIndex !== -1) selected.add(highIndex);
    }
    const invalidIndex = Array.from({ length: end - start }, (_, k) => start + k)
      .find((i) => keys.every((key) => rows[i][key] == null));
    if (invalidIndex !== undefined) selected.add(invalidIndex);
  }
  return Array.from(selected).sort((a, b) => a - b).map((index) => rows[index]);
}
export function buildSessionComparatives(stages, summaries, phase = "", level = "") {
  const byId = new Map((summaries || []).map((s) =>
    [String(s.flowDataDevicesId), s]));
  return (stages || [])
    .filter((s) => (phase === "" || Number(s.phase) === Number(phase)) &&
      (level === "" || Number(s.level) === Number(level)))
    .sort((a, b) => Date.parse(a.playStart) - Date.parse(b.playStart))
    .map((stage, i) => {
      const device = (stage.flowDataDevicesValues || [])
        .find((d) => d.deviceName === "Pitaco 3.0");
      const summary = byId.get(String(stage.flowDataDevicesId));
      return {
        name: `E${i + 1}`,
        date: stage.playStart ? new Date(stage.playStart).toLocaleString("pt-BR") : "",
        phase: stage.phase, level: stage.level,
        maxExpFlow: device ? num(device.maxFlowValue) : null,
        maxInsFlow: device ? num(device.minFlowValue) : null,
        bpm: summary && summary.metrics && summary.metrics.bpm
          ? num(summary.metrics.bpm.mean) : null,
        spo2: summary && summary.metrics && summary.metrics.spo2Demo
          ? num(summary.metrics.spo2Demo.mean) : null,
        bpmCoverage: summary && summary.metrics && summary.metrics.bpm
          ? num(summary.metrics.bpm.coverageRatio) : null,
        spo2Coverage: summary && summary.metrics && summary.metrics.spo2Demo
          ? num(summary.metrics.spo2Demo.coverageRatio) : null
      };
    });
}

/**
 * Convert a browser-local calendar day to an absolute UTC endpoint.
 * The Azure API compares against MongoDB's UTC created_at timestamps.
 * A stage at 00:58Z on Nov 23 belongs to Nov 22 for a user in UTC-03.
 */
export function localDayBoundary(value, endOfDay = false) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day,
    endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 ||
      date.getDate() !== day) throw new Error("Data inválida.");
  return date.toISOString();
}
