// Fixed educational reference intervals, never a clinical decision rule.
// AHA (adult resting HR): https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates
// MedlinePlus (validated pulse oximetry): https://medlineplus.gov/lab-tests/pulse-oximetry/
export const EDUCATIONAL_REFERENCES = Object.freeze({
  bpm: Object.freeze({
    lower: 60, upper: 100, unit: "bpm",
    label: "Faixa ilustrativa de adultos em repouso: 60–100 bpm",
    caution: "Não é uma faixa de segurança durante exercício ou reabilitação; a resposta cardíaca depende do paciente.",
    source: "American Heart Association",
    url: "https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates"
  }),
  spo2: Object.freeze({
    lower: 95, upper: 100, unit: "%",
    label: "Faixa ilustrativa em oxímetros validados: 95–100%",
    caution: "SpO₂ do PITACO 3.0 é DEMO, não calibrada. Esta faixa NÃO indica segurança, diagnóstico ou adequação do sinal.",
    source: "MedlinePlus",
    url: "https://medlineplus.gov/lab-tests/pulse-oximetry/"
  })
});

export function educationalReferenceFor(type, enabled = true) {
  return enabled && Object.prototype.hasOwnProperty.call(EDUCATIONAL_REFERENCES, type)
    ? EDUCATIONAL_REFERENCES[type] : null;
}
