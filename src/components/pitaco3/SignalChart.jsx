import React from "react";
import { Box, Typography } from "@mui/material";
import SharedLineChart from "../platform-graph/SharedLineChart";
import { educationalReferenceFor } from "../../services/pitaco3References";

const ink = "#11192A";
const charts = {
  flow: {
    title: "Fluxo respiratório — inspiração e expiração", unit: "L/min",
    lines: [{ key: "flowValue", label: "Fluxo", color: "#1d4ed8" }]
  },
  bpm: {
    title: "Frequência cardíaca — estimativa experimental", unit: "bpm",
    lines: [{ key: "bpm", label: "BPM", color: "#dc2626" }]
  },
  spo2: {
    title: "SpO₂ — DEMO não calibrada", unit: "%",
    lines: [{ key: "spo2Percent", label: "SpO₂ DEMO", color: "#0d9488" }]
  },
  ppg: {
    title: "PPG bruto — RED / IR", unit: "contagens ADC",
    lines: [
      { key: "red", label: "RED", color: "#dc2626" },
      { key: "ir", label: "IR", color: "#4338ca" }
    ]
  }
};

export function SignalChart({ type, data = [], showReference = true }) {
  const config = charts[type];
  if (!config) return null;
  const reference = educationalReferenceFor(type, showReference);
  return (
    <Box sx={{
      backgroundColor: "#fff", color: ink, border: "1px solid #dce3ec",
      borderRadius: 2, padding: 2, marginY: 2
    }}>
      <Typography variant="h6" sx={{ color: ink, fontSize: 16, fontWeight: "bold", mb: 1 }}>
        {config.title}
      </Typography>
      <Typography variant="caption" sx={{ color: ink, display: "block", mb: 1 }}>
        Tempo relativo ao início da execução (segundos) · {config.unit}
      </Typography>
      <SharedLineChart data={data} xKey="t" numericXAxis
        lines={config.lines} yAxisLabel={config.unit}
        reference={reference} height={310}
        emptyLabel="Sem medições disponíveis para este filtro." />
      {reference && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: ink, fontWeight: 600 }}>
            {reference.label} — somente exemplo de referência
          </Typography>
          <Typography variant="caption" sx={{ color: "#825e12" }}>
            {reference.caution} Fonte:{" "}
            <a href={reference.url} target="_blank" rel="noopener noreferrer">
              {reference.source}
            </a>.
          </Typography>
        </Box>
      )}
      {type === "spo2" && !reference && (
        <Typography variant="caption" sx={{ color: "#825e12" }}>
          Demonstração experimental: não utilizar para diagnóstico ou decisões clínicas.
        </Typography>
      )}
      {type === "ppg" && (
        <Typography variant="caption" sx={{ color: ink }}>
          Sinal óptico não normalizado. A visualização pode ser reduzida para desempenho.
        </Typography>
      )}
    </Box>
  );
}
