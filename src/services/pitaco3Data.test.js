import { pitaco3Device, buildSignalSeries, buildSessionComparatives, decimate, localDayBoundary }
  from "./pitaco3Data";

const stage = {
  playStart: "2026-11-23T00:54:49.000Z",
  flowDataDevicesId: "flow-1", phase: 1, level: 6,
  flowDataDevicesValues: [{ deviceName: "Pitaco 3.0", maxFlowValue: 245, minFlowValue: -100 }]
};
const record = { flowDataDevices: [{
  deviceName: "Pitaco 3.0",
  flowData: [{ timestamp: "2026-11-23T00:54:50.000Z", flowValue: 12 }],
  bpmData: [
    { timestamp: "2026-11-23T00:54:51.000Z", bpm: 80, contactConfirmed: true, g1Approved: true },
    { timestamp: "2026-11-23T00:54:52.000Z", bpm: null, contactConfirmed: true, g1Approved: false }
  ],
  spo2Data: [
    { timestamp: "2026-11-23T00:54:53.000Z", spo2Percent: 96,
      contactConfirmed: true, g1Approved: true, isDemonstration: true },
    { timestamp: "2026-11-23T00:54:54.000Z", spo2Percent: 98,
      contactConfirmed: false, g1Approved: false, isDemonstration: true }
  ],
  ppgRawData: [
    { timestamp: "2026-11-23T00:54:50.000Z", red: 200, ir: 300, contact: true, sqiReason: 0 },
    { timestamp: "2026-11-23T00:54:51.000Z", red: 201, ir: 301, contact: false, sqiReason: 1 }
  ]
}] };
test("reads 4 modalities and keeps invalid values as null", () => {
  expect(pitaco3Device(record).deviceName).toBe("Pitaco 3.0");
  const all = buildSignalSeries(record, stage, false);
  expect(all.flow[0].flowValue).toBe(12);
  expect(all.bpm.map((p) => p.bpm)).toEqual([80, null]);
  expect(all.spo2.map((p) => p.spo2Percent)).toEqual([96, 98]);
  expect(all.ppg.length).toBe(2);
  const approved = buildSignalSeries(record, stage, true);
  expect(approved.spo2.map((p) => p.spo2Percent)).toEqual([96, null]);
  expect(approved.ppg.map((p) => p.red)).toEqual([200, null]);
  expect(approved.flow.length).toBe(1);
});
test("joins overview respiratory metadata and physiology summary without replacing null", () => {
  const summary = [{ flowDataDevicesId: "flow-1", metrics: {
    bpm: { mean: 80, coverageRatio: .5 },
    spo2Demo: { mean: null, coverageRatio: 0 }
  }}];
  const rows = buildSessionComparatives([stage], summary);
  expect(rows).toHaveLength(1);
  expect(rows[0].maxExpFlow).toBe(245);
  expect(rows[0].maxInsFlow).toBe(-100);
  expect(rows[0].bpm).toBe(80);
  expect(rows[0].spo2).toBeNull();
  expect(rows[0].bpmCoverage).toBe(.5);
});
test("downsampling retains the last point", () => {
  const data = Array.from({ length: 4000 }, (_, i) => ({ t: i }));
  const selected = decimate(data, 1000);
  expect(selected.length).toBeLessThan(1002);
  expect(selected[selected.length - 1].t).toBe(3999);
});

test("local calendar dates become UTC bounds for MongoDB filtering", () => {
  const day = "2026-11-22";
  expect(localDayBoundary(day)).toBe(new Date(2026, 10, 22, 0, 0, 0, 0).toISOString());
  expect(localDayBoundary(day, true))
    .toBe(new Date(2026, 10, 22, 23, 59, 59, 999).toISOString());
  expect(() => localDayBoundary("2026-02-30")).toThrow();
});
