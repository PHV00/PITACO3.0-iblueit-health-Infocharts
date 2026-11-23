/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Grid, MenuItem, Select,
  Typography, TextField, CircularProgress } from "@mui/material";
import { getPitaco3History, getPitaco3Flow } from "../../services/api/pitaco3";
import { buildSignalSeries } from "../../services/pitaco3Data";
import { SignalChart } from "./SignalChart";

const signals = [
  ["flow", "Fluxo respiratório"],
  ["bpm", "BPM experimental"],
  ["spo2", "SpO₂ DEMO"],
  ["ppg", "RED / IR"]
];

export default function Pitaco3ResultsPanel({ patientId, dataIni, dataFim, reloadKey }) {
  const [stages, setStages] = useState([]);
  const [stageId, setStageId] = useState("");
  const [document, setDocument] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(["flow", "bpm", "spo2", "ppg"]);
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [bpmReference, setBpmReference] = useState("");
  const [spo2Reference, setSpo2Reference] = useState("");

  useEffect(() => {
    let alive = true;
    setStages([]); setStageId(""); setDocument(null); setError("");
    if (!patientId) return () => { alive = false; };
    setLoadingHistory(true);
    getPitaco3History(patientId, {
      ...(dataIni ? { dataIni } : {}),
      ...(dataFim ? { dataFim } : {})
    }).then((rows) => {
      if (!alive) return;
      setStages(rows);
      setStageId(rows.length ? String(rows[rows.length - 1]._id) : "");
    }).catch((e) => {
      if (alive) setError(e.message || "Falha ao consultar histórico.");
    }).finally(() => { if (alive) setLoadingHistory(false); });
    return () => { alive = false; };
  }, [patientId, reloadKey]); // Dates are applied only when the user clicks Filtrar.

  const stage = stages.find((s) => String(s._id) === stageId);
  useEffect(() => {
    let alive = true;
    setDocument(null);
    if (!stage || !stage.flowDataDevicesId) return () => { alive = false; };
    setLoadingSignals(true); setError("");
    getPitaco3Flow(String(stage.flowDataDevicesId)).then((flow) => {
      if (alive) setDocument(flow);
    }).catch((e) => { if (alive) setError(e.message || "Falha ao carregar sinais."); })
      .finally(() => { if (alive) setLoadingSignals(false); });
    return () => { alive = false; };
  }, [stageId, stages]);

  const series = useMemo(() => buildSignalSeries(document, stage || {}, onlyApproved),
    [document, stage, onlyApproved]);
  const toggle = (key) => setVisible((previous) => previous.includes(key)
    ? previous.filter((v) => v !== key) : [...previous, key]);
  const referenceFor = (key) => {
    const input = key === "bpm" ? bpmReference : key === "spo2" ? spo2Reference : "";
    return showReference && input !== "" && Number.isFinite(Number(input))
      ? Number(input) : null;
  };

  if (!patientId) return <Typography>Selecione um paciente para consultar os resultados.</Typography>;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Sinais da execução — PITACO 3.0</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Os registros são experimentais. A escolha dos filtros não modifica os dados no Atlas.
      </Typography>
      {loadingHistory ? <CircularProgress size={26} /> : (
        <Box sx={{ maxWidth: 650, mb: 2 }}>
          <Typography variant="subtitle2">Execução</Typography>
          <Select fullWidth size="small" value={stageId}
            displayEmpty onChange={(e) => setStageId(e.target.value)}>
            {!stages.length && <MenuItem value="">Nenhuma execução encontrada</MenuItem>}
            {stages.map((s) => (
              <MenuItem key={String(s._id)} value={String(s._id)}>
                {s.playStart ? new Date(s.playStart).toLocaleString("pt-BR") : "Data indisponível"}
                {" — Fase "}{s.phase}{" / Nível "}{s.level}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
      {stage && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Resultado: {stage.result || "—"} · Pontuação: {stage.score ?? "—"} ·
          Borg: {stage.BorgScale ?? "—"} · Duração: {stage.duration != null
            ? Number(stage.duration).toFixed(1) + " s" : "—"}
        </Typography>
      )}
      <Box sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Sinais a exibir</Typography>
        <Button size="small" onClick={() => setVisible(signals.map(([key]) => key))}>
          Mostrar todos
        </Button>
        <Button size="small" onClick={() => setVisible([])}>Limpar</Button>
        <Grid container spacing={1}>
          {signals.map(([key, label]) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <FormControlLabel control={<Checkbox size="small"
                checked={visible.includes(key)} onChange={() => toggle(key)} />}
                label={label} />
            </Grid>
          ))}
        </Grid>
        <FormControlLabel control={<Checkbox checked={onlyApproved}
          onChange={(e) => setOnlyApproved(e.target.checked)} />}
          label="Filtrar estimativas por aprovação técnica (contato e G1)" />
        <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
          No PPG bruto, o filtro exige contato e SQI sem motivo de rejeição; o fluxo
          respiratório não possui essas flags. Lacunas permanecem visíveis.
        </Typography>
        <FormControlLabel control={<Checkbox checked={showReference}
          onChange={(e) => setShowReference(e.target.checked)} />}
          label="Mostrar linhas de referência configuradas (não clínicas)" />
        {showReference && (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
            <TextField label="Referência BPM" size="small" type="number"
              value={bpmReference} onChange={(e) => setBpmReference(e.target.value)} />
            <TextField label="Referência SpO₂ DEMO (%)" size="small" type="number"
              value={spo2Reference} onChange={(e) => setSpo2Reference(e.target.value)} />
          </Box>
        )}
      </Box>
      {error && <Typography color="error" role="alert">{error}</Typography>}
      {loadingSignals && <CircularProgress size={26} />}
      {!loadingSignals && stage && document && (
        <>
          {visible.includes("flow") && <SignalChart type="flow" data={series.flow} />}
          {visible.includes("bpm") && <SignalChart type="bpm" data={series.bpm}
            reference={referenceFor("bpm")} />}
          {visible.includes("spo2") && <SignalChart type="spo2" data={series.spo2}
            reference={referenceFor("spo2")} />}
          {visible.includes("ppg") && <SignalChart type="ppg" data={series.ppg} />}
          {series.rawCount > series.ppg.length && (
            <Typography variant="caption">
              PPG: {series.rawCount} pontos recebidos; {series.ppg.length}
              pontos na visualização reduzida.
            </Typography>
          )}
        </>
      )}
      {!loadingHistory && !stages.length && !error && (
        <Typography color="text.secondary">Não há execuções PITACO 3.0 no período.</Typography>
      )}
    </Box>
  );
}
