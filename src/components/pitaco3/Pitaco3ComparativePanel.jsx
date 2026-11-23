import React, { useState } from "react";
import { Box, Button, FormControlLabel, Checkbox, Grid, TextField,
  Typography, CircularProgress } from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, ReferenceLine, Legend } from "recharts";
import { getPitaco3History, getPitaco3SummaryHistory } from "../../services/api/pitaco3";
import { buildSessionComparatives } from "../../services/pitaco3Data";

const items = [
  { key: "maxExpFlow", title: "Pico expiratório", unit: "L/min", color: "#0d7ad1" },
  { key: "bpm", title: "Frequência cardíaca média — estimativas tecnicamente aceitas",
    unit: "bpm", color: "#dc2626" },
  { key: "spo2", title: "SpO₂ média — DEMO não calibrada",
    unit: "%", color: "#0d9488" }
];
function ComparativeChart({ item, data, reference }) {
  const valid = data.some((p) => p[item.key] !== null && p[item.key] !== undefined);
  return (
    <Box sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2, mb: 2 }}>
      <Typography sx={{ fontWeight: "bold", mb: 1 }}>{item.title}</Typography>
      {!valid ? <Typography color="text.secondary">Sem estimativas disponíveis.</Typography> : (
        <Box sx={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis width={65} domain={["auto", "auto"]} />
              <Tooltip content={({ active, payload }) => active && payload && payload[0] ? (
                <Box sx={{ p: 1, background: "#fff", border: "1px solid #ddd" }}>
                  <Typography variant="body2">{payload[0].payload.date}</Typography>
                  <Typography variant="body2">
                    {payload[0].value != null ? Number(payload[0].value).toFixed(2) : "Sem dados"} {item.unit}
                  </Typography>
                  {item.key === "bpm" && <Typography variant="caption">
                    Cobertura: {payload[0].payload.bpmCoverage == null ? "—" :
                      (payload[0].payload.bpmCoverage * 100).toFixed(0) + "%"}
                  </Typography>}
                  {item.key === "spo2" && <Typography variant="caption">
                    Cobertura: {payload[0].payload.spo2Coverage == null ? "—" :
                      (payload[0].payload.spo2Coverage * 100).toFixed(0) + "%"}
                  </Typography>}
                </Box>
              ) : null} />
              <Legend />
              <Line name={item.title} dataKey={item.key} stroke={item.color}
                type="linear" isAnimationActive={false} connectNulls={false} />
              {Number.isFinite(reference) && (
                <ReferenceLine y={reference} stroke="#b7791f" strokeDasharray="5 5"
                  label={{ value: "Referência informativa", fontSize: 10 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
      {item.key === "spo2" && <Typography variant="caption" sx={{ color: "#995000" }}>
        SpO₂ DEMO: estimativas de pesquisa, sem calibração ou interpretação clínica.
      </Typography>}
    </Box>
  );
}
export default function Pitaco3ComparativePanel({ patientId }) {
  const [phase, setPhase] = useState("");
  const [level, setLevel] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReference, setShowReference] = useState(false);
  const [references, setReferences] = useState({ bpm: "", spo2: "" });
  async function apply(event) {
    event.preventDefault();
    if (!patientId) return;
    setLoading(true); setError("");
    const filters = { ...(phase !== "" ? { phase } : {}),
      ...(level !== "" ? { level } : {}) };
    try {
      const [stages, summaries] = await Promise.all([
        getPitaco3History(patientId, filters),
        getPitaco3SummaryHistory(patientId, filters)
      ]);
      setRows(buildSessionComparatives(stages, summaries, phase, level));
    } catch (e) {
      setRows([]);
      setError(e.message || "Falha ao consultar histórico comparativo.");
    } finally { setLoading(false); }
  }
  const reference = (key) => showReference && references[key] !== "" &&
    Number.isFinite(Number(references[key])) ? Number(references[key]) : null;
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Comparação de execuções do paciente selecionado. Use a mesma fase e nível
        para resultados mais comparáveis. As referências são informativas, não clínicas.
      </Typography>
      <Box component="form" onSubmit={apply} sx={{ display: "flex", flexWrap: "wrap",
        gap: 2, alignItems: "center", mb: 3 }}>
        <TextField label="Fase (opcional)" size="small" type="number" value={phase}
          inputProps={{ min: 0, step: 1 }} onChange={(e) => setPhase(e.target.value)} />
        <TextField label="Nível (opcional)" size="small" type="number" value={level}
          inputProps={{ min: 0, step: 1 }} onChange={(e) => setLevel(e.target.value)} />
        <Button type="submit" variant="contained" disabled={!patientId || loading}>Comparar</Button>
      </Box>
      <FormControlLabel control={<Checkbox checked={showReference}
        onChange={(e) => setShowReference(e.target.checked)} />}
        label="Exibir linhas de referência configuradas" />
      {showReference && (
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {["bpm", "spo2"].map((key) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField label={key === "bpm" ? "BPM de referência" : "SpO₂ DEMO de referência (%)"}
                size="small" type="number" value={references[key]}
                onChange={(e) => setReferences((p) => ({ ...p, [key]: e.target.value }))} />
            </Grid>
          ))}
        </Grid>
      )}
      {error && <Typography color="error" role="alert">{error}</Typography>}
      {loading && <CircularProgress size={26} />}
      {!loading && rows.length > 0 && (
        <>
          <Typography variant="caption" sx={{ display: "block", mb: 2 }}>
            {rows.length} execuções exibidas · valores reais recuperados da API
          </Typography>
          {items.map((item) => <ComparativeChart key={item.key} item={item}
            data={rows} reference={reference(item.key)} />)}
        </>
      )}
      {!loading && !rows.length && !error &&
        <Typography color="text.secondary">Selecione os filtros e clique em Comparar.</Typography>}
    </Box>
  );
}
