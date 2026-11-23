/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Grid,
  Typography, CircularProgress } from "@mui/material";
import SelectComponent from "../select";
import { getPitaco3History, getPitaco3Flow } from "../../services/api/pitaco3";
import { buildSignalSeries } from "../../services/pitaco3Data";
import { SignalChart } from "./SignalChart";

const signals = [
  ["flow", "Fluxo respiratório"],
  ["bpm", "Frequência cardíaca"],
  ["spo2", "SpO₂ (DEMO)"],
  ["ppg", "PPG (RED / IR)"]
];

export default function Pitaco3ResultsPanel({ patientId, dataIni, dataFim, reloadKey }) {
  const [stages, setStages] = useState([]);
  const [stageId, setStageId] = useState("");
  const [document, setDocument] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(["flow", "bpm", "spo2", "ppg"]);
  const [quality, setQuality] = useState("all");
  const flowCache = useRef(new Map());
  const [showReference, setShowReference] = useState(true);

  useEffect(() => { flowCache.current.clear(); }, [patientId]);

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
    const id = String(stage.flowDataDevicesId);
    const cache = flowCache.current;
    if (cache.has(id)) {
      setDocument(cache.get(id));
      setLoadingSignals(false);
      return () => { alive = false; };
    }
    setLoadingSignals(true); setError("");
    getPitaco3Flow(id).then((flow) => {
      if (alive) {
        // Cache per selected patient only; limit memory use to five sessions.
        if (cache.size >= 5) cache.delete(cache.keys().next().value);
        cache.set(id, flow);
        setDocument(flow);
      }
    }).catch((e) => { if (alive) setError(e.message || "Falha ao carregar sinais."); })
      .finally(() => { if (alive) setLoadingSignals(false); });
    return () => { alive = false; };
  }, [stageId, stages]);

  const series = useMemo(() => buildSignalSeries(document, stage || {}, quality === "approved"),
    [document, stage, quality]);
  const toggle = (key) => setVisible((previous) => previous.includes(key)
    ? previous.filter((v) => v !== key) : [...previous, key]);

  if (!patientId) return <Typography>Selecione um paciente para consultar os resultados.</Typography>;

  return (
    <Box sx={{ mt: 3, color: "#11192A" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Sinais da execução — PITACO 3.0</Typography>
      {loadingHistory ? <CircularProgress size={26} /> : (
        <Box sx={{ maxWidth: 650, mb: 2 }}>
          <SelectComponent title="Execução" initialKey={stageId}
            handleChangeCallBack={setStageId}
            items={stages.length ? stages.map((s) => ({
              key: String(s._id),
              value: `${s.playStart ? new Date(s.playStart).toLocaleString("pt-BR") : "Data indisponível"} — Fase ${s.phase} / Nível ${s.level}`
            })) : [{ key: "", value: "Nenhuma execução encontrada" }]} />
        </Box>
      )}
      {stage && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Resultado: {stage.result || "—"} · Pontuação: {stage.score ?? "—"} ·
          Borg: {stage.BorgScale ?? "—"} · Duração: {stage.duration != null
            ? Number(stage.duration).toFixed(1) + " s" : "—"}
        </Typography>
      )}
      <Box sx={{ backgroundColor: "#fff", color: "#11192A",
        border: "1px solid #dce3ec", borderRadius: 2, p: 2, mb: 2 }}>
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
        <Box sx={{ width: { xs: "100%", sm: 280 }, mt: 1.5, mb: 1 }}>
          <SelectComponent title="Qualidade das amostras" initialKey={quality}
            handleChangeCallBack={setQuality}
            items={[
              { key: "all", value: "Todas as amostras" },
              { key: "approved", value: "Somente leituras aprovadas" }
            ]} />
        </Box>
        <FormControlLabel control={<Checkbox checked={showReference}
          onChange={(e) => setShowReference(e.target.checked)} />}
          label="Exibir faixas de referência" />
      </Box>
      {error && <Typography color="error" role="alert">{error}</Typography>}
      {loadingSignals && <CircularProgress size={26} />}
      {!loadingSignals && stage && document && (
        <>
          {visible.includes("flow") && <SignalChart type="flow" data={series.flow} />}
          {visible.includes("bpm") && <SignalChart type="bpm" data={series.bpm}
            showReference={showReference} />}
          {visible.includes("spo2") && <SignalChart type="spo2" data={series.spo2}
            showReference={showReference} />}
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
