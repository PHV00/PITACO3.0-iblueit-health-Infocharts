import React, { useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, TextField,
  Typography, CircularProgress } from "@mui/material";
import SharedLineChart from "../platform-graph/SharedLineChart";
import { inputSx } from "./controlStyles";
import { educationalReferenceFor } from "../../services/pitaco3References";
import { getPitaco3History, getPitaco3SummaryHistory } from "../../services/api/pitaco3";
import { buildSessionComparatives } from "../../services/pitaco3Data";

const ink = "#11192A";
const items = [
  { key: "maxExpFlow", title: "Pico expiratório", unit: "L/min", color: "#1d4ed8" },
  { key: "bpm", title: "BPM médio — estimativas tecnicamente aceitas",
    unit: "bpm", color: "#dc2626" },
  { key: "spo2", title: "SpO₂ média — DEMO não calibrada",
    unit: "%", color: "#0d9488" }
];
function ComparativeChart({ item, data, showReference }) {
  const reference = educationalReferenceFor(item.key, showReference);
  const tooltipContent = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0].payload;
    const value = row[item.key];
    const coverage = item.key === "bpm" ? row.bpmCoverage : row.spo2Coverage;
    return (
      <Box sx={{ p: 1, backgroundColor: "#fff", border: "1px solid #dce3ec", color: ink }}>
        <Typography variant="body2" sx={{ color: ink }}>{row.date}</Typography>
        <Typography variant="body2" sx={{ color: ink }}>
          {value == null ? "Sem dados" : Number(value).toFixed(2) + " " + item.unit}
        </Typography>
        {item.key !== "maxExpFlow" && (
          <Typography variant="caption" sx={{ color: ink }}>
            Cobertura técnica: {coverage == null ? "—" : (coverage * 100).toFixed(0) + "%"}
          </Typography>
        )}
      </Box>
    );
  };
  return (
    <Box sx={{ border: "1px solid #dce3ec", backgroundColor: "#fff",
      color: ink, borderRadius: 2, p: 2, mb: 2 }}>
      <Typography sx={{ color: ink, fontWeight: "bold", mb: 1 }}>{item.title}</Typography>
      <SharedLineChart data={data} xKey="name" yAxisLabel={item.unit}
        lines={[{ key: item.key, label: item.title, color: item.color }]}
        height={290} reference={reference} tooltipContent={tooltipContent}
        emptyLabel="Sem estimativas reais disponíveis para esta comparação." />
      {reference && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: ink, fontWeight: 600 }}>
            {reference.label} — exemplo fixo
          </Typography>
          <Typography variant="caption" sx={{ color: "#825e12" }}>
            {reference.caution} Fonte:{" "}
            <a href={reference.url} target="_blank" rel="noopener noreferrer">
              {reference.source}
            </a>.
          </Typography>
        </Box>
      )}
      {item.key === "spo2" && !reference && (
        <Typography variant="caption" sx={{ color: "#825e12" }}>
          SpO₂ DEMO: não calibrada, sem interpretação clínica.
        </Typography>
      )}
    </Box>
  );
}

export default function Pitaco3ComparativePanel({ patientId }) {
  const [phase, setPhase] = useState("");
  const [level, setLevel] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReference, setShowReference] = useState(true);

  async function apply(event) {
    event.preventDefault();
    if (!patientId) return;
    setLoading(true); setError("");
    const filters = {
      ...(phase !== "" ? { phase } : {}),
      ...(level !== "" ? { level } : {})
    };
    try {
      const [stages, summaries] = await Promise.all([
        getPitaco3History(patientId, filters),
        getPitaco3SummaryHistory(patientId, filters)
      ]);
      setRows(buildSessionComparatives(stages, summaries, phase, level));
    } catch (e) {
      setRows([]);
      setError(e.message || "Falha ao consultar histórico comparativo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ mt: 2, color: ink }}>
      <Typography variant="body2" sx={{ mb: 2, color: ink }}>
        Comparação entre execuções do paciente selecionado. Selecione a mesma fase
        e nível para uma análise mais comparável.
      </Typography>
      <Box component="form" onSubmit={apply} sx={{
        display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2
      }}>
        <TextField label="Fase (opcional)" size="small" type="number"
          sx={inputSx} value={phase} inputProps={{ min: 0, step: 1 }}
          onChange={(e) => setPhase(e.target.value)} />
        <TextField label="Nível (opcional)" size="small" type="number"
          sx={inputSx} value={level} inputProps={{ min: 0, step: 1 }}
          onChange={(e) => setLevel(e.target.value)} />
        <Button type="submit" variant="contained" disabled={!patientId || loading}
          sx={{ bgcolor: "#1e2b48" }}>Comparar</Button>
      </Box>
      <FormControlLabel sx={{ color: ink }}
        control={<Checkbox checked={showReference}
          onChange={(e) => setShowReference(e.target.checked)} />}
        label="Exibir faixas didáticas fixas de BPM (repouso) e SpO₂ (oxímetro validado)" />
      <Typography variant="caption" sx={{ color: "#825e12", display: "block", mb: 2 }}>
        Não são limites de segurança durante exercícios nem uma avaliação clínica;
        a SpO₂ do PITACO 3.0 é experimental (DEMO).
      </Typography>
      {error && <Typography color="error" role="alert">{error}</Typography>}
      {loading && <CircularProgress size={26} />}
      {!loading && rows.length > 0 && (
        <>
          <Typography variant="caption" sx={{ color: ink, display: "block", mb: 2 }}>
            {rows.length} execuções exibidas · medições reais recuperadas da API
          </Typography>
          {items.map((item) => (
            <ComparativeChart key={item.key} item={item} data={rows}
              showReference={showReference} />
          ))}
        </>
      )}
      {!loading && !rows.length && !error && (
        <Typography sx={{ color: ink }}>
          Selecione os filtros e clique em Comparar.
        </Typography>
      )}
    </Box>
  );
}
