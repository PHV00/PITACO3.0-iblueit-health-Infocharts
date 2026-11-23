import React from "react";
import { Box, Typography } from "@mui/material";
import SharedLineChart from "../platform-graph/SharedLineChart";
import { educationalReferenceFor } from "../../services/pitaco3References";

const ink = "#11192A";
const charts = {
  flow: {
    title: "Fluxo respiratório", unit: "L/min",
    lines: [{ key: "flowValue", label: "Fluxo", color: "#1d4ed8" }]
  },
  bpm: {
    title: "Frequência cardíaca", unit: "bpm",
    lines: [{ key: "bpm", label: "BPM", color: "#dc2626" }]
  },
  spo2: {
    title: "Oxigenação — SpO₂ (DEMO)", unit: "%",
    lines: [{ key: "spo2Percent", label: "SpO₂ (DEMO)", color: "#0d9488" }]
  },
  ppg: {
    title: "Sinal PPG", unit: "contagens ADC",
    lines: [
      { key: "red", label: "RED", color: "#dc2626" },
      { key: "ir", label: "IR", color: "#4338ca" }
    ]
  }
};

// Titles identify one-series plots; the Recharts legend is kept for RED/IR.
export function SignalChart({ type, data = [], showReference = true }) {
  const config = charts[type];
  if (!config) return null;
  const reference = educationalReferenceFor(type, showReference);
  return (
    <Box sx={{
      backgroundColor: "#fff", color: ink, border: "1px solid #dce3ec",
      borderRadius: 2, padding: 2, marginY: 2
    }}>
      <Typography variant="h6" sx={{ color: ink, fontSize: 16, fontWeight: "bold", mb: 0.5 }}>
        {config.title}
      </Typography>
      <Typography variant="caption" sx={{ color: ink, display: "block", mb: 1 }}>
        Tempo da execução (s) · {config.unit}
      </Typography>
      <SharedLineChart data={data} xKey="t" numericXAxis
        lines={config.lines} yAxisLabel={config.unit}
        reference={reference} height={300}
        emptyLabel="Sem amostras para o filtro selecionado." />
      {reference && (
        <Typography variant="caption" sx={{ color: "#75580f", display: "block", mt: 0.75 }}>
          Faixa de referência: {type === "bpm" ? "60–100 bpm (repouso)" : "95–100% (SpO₂)"}
        </Typography>
      )}
      {type === "ppg" && (
        <Typography variant="caption" sx={{ color: ink }}>
          Amostragem para visualização: {data.length} pontos.
        </Typography>
      )}
    </Box>
  );
}
