import React from "react";
import { Box, Typography } from "@mui/material";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine } from "recharts";

const charts = {
  flow: { title: "Fluxo respiratório — inspiração e expiração", unit: "L/min",
    lines: [{ key: "flowValue", label: "Fluxo", color: "#1d4ed8" }] },
  bpm: { title: "Frequência cardíaca — estimativa experimental", unit: "bpm",
    lines: [{ key: "bpm", label: "BPM", color: "#dc2626" }] },
  spo2: { title: "SpO₂ — DEMO não calibrada", unit: "%",
    lines: [{ key: "spo2Percent", label: "SpO₂ DEMO", color: "#0d9488" }] },
  ppg: { title: "PPG bruto — RED / IR", unit: "contagens ADC",
    lines: [
      { key: "red", label: "RED", color: "#dc2626" },
      { key: "ir", label: "IR", color: "#4338ca" }
    ] }
};

export function SignalChart({ type, data = [], reference = null }) {
  const config = charts[type];
  if (!config) return null;
  const hasData = data.some((d) => config.lines.some((l) => d[l.key] !== null));
  return (
    <Box sx={{ border: "1px solid #ddd", borderRadius: 2, padding: 2, marginY: 2 }}>
      <Typography variant="h6" sx={{ fontSize: 16, fontWeight: "bold", mb: 1 }}>
        {config.title}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
        Tempo relativo ao início da execução (segundos) · {config.unit}
      </Typography>
      {type === "spo2" && (
        <Typography variant="body2" sx={{ mb: 1, color: "#995000" }}>
          Demonstração experimental — não utilizar para diagnóstico ou decisões clínicas.
        </Typography>
      )}
      {!hasData ? (
        <Typography color="text.secondary">Sem medições disponíveis para este filtro.</Typography>
      ) : (
        <Box sx={{ height: 310, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 25, left: 5, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="t" domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => Number(v).toFixed(0)} />
              <YAxis tickLine={false} width={65} domain={["auto", "auto"]} />
              <Tooltip labelFormatter={(v) => `${Number(v).toFixed(2)} s`} />
              <Legend />
              {config.lines.map((l) => (
                <Line key={l.key} type="linear" dataKey={l.key} name={l.label}
                  stroke={l.color} dot={false} isAnimationActive={false}
                  connectNulls={false} strokeWidth={1.5} />
              ))}
              {Number.isFinite(reference) && (
                <ReferenceLine y={reference} stroke="#bd7500" strokeDasharray="6 4"
                  label={{ value: "Referência configurada", position: "insideTopRight", fontSize: 10 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
      {type === "ppg" && <Typography variant="caption">
        Sinal óptico não normalizado; a visualização pode ser reduzida para desempenho.
      </Typography>}
    </Box>
  );
}
