import { EDUCATIONAL_REFERENCES, educationalReferenceFor }
  from "./pitaco3References";

test("BPM reference is fixed and explicitly resting only", () => {
  expect(EDUCATIONAL_REFERENCES.bpm.lower).toBe(60);
  expect(EDUCATIONAL_REFERENCES.bpm.upper).toBe(100);
  expect(EDUCATIONAL_REFERENCES.bpm.caution).toMatch(/exercício/);
  expect(EDUCATIONAL_REFERENCES.bpm.url).toMatch(/heart\.org/);
});
test("SpO2 DEMO reference does not assert clinical accuracy", () => {
  expect(EDUCATIONAL_REFERENCES.spo2.lower).toBe(95);
  expect(EDUCATIONAL_REFERENCES.spo2.upper).toBe(100);
  expect(EDUCATIONAL_REFERENCES.spo2.caution).toMatch(/DEMO/);
  expect(EDUCATIONAL_REFERENCES.spo2.url).toMatch(/medlineplus/);
});
test("no reference area for unrelated modalities or disabled mode", () => {
  expect(educationalReferenceFor("flow")).toBeNull();
  expect(educationalReferenceFor("ppg")).toBeNull();
  expect(educationalReferenceFor("bpm", false)).toBeNull();
  expect(educationalReferenceFor("spo2", true).unit).toBe("%");
});
