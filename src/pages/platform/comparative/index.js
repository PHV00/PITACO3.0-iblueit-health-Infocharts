import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import DeviceSelect from "../../../components/device-select";
import SelectComponent from "../../../components/select";
import { useMyContext } from "../../../providers/MyContext";
import { getPlatformComparative } from "../../../services/api/platform";
import PlatformGraphComparative from "../../../components/platform-graph/comparative";
import Pitaco3ComparativePanel from "../../../components/pitaco3/Pitaco3ComparativePanel";
import { inputSx } from "../../../components/pitaco3/controlStyles";

const visuals = [
  { key: "expiratory_peak", value: "Pico Expiratório" },
  { key: "inspiratory_peak", value: "Pico Inspiratório" },
  { key: "score", value: "Pontuação" },
  { key: "ratio", value: "Razão" }
];
const legend = {
  expiratory_peak: ["Pico expiratório (L/min)", "L/min"],
  inspiratory_peak: ["Pico inspiratório (L/min)", "L/min"],
  score: ["Pontuação", "pontos"],
  ratio: ["Razão (%)", "%"]
};
export default function PlatformComparative() {
  const context = useMyContext();
  const [device, setDevice] = useState("Pitaco");
  const [condition, setCondition] = useState("Healthy");
  const [sex, setSex] = useState("Male");
  const [initialAge, setInitialAge] = useState(1);
  const [finalAge, setFinalAge] = useState(99);
  const [visualization, setVisualization] = useState("expiratory_peak");
  const [shown, setShown] = useState("expiratory_peak");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setRows([]); setError(""); }, [context.patientId]);

  async function apply(event) {
    event.preventDefault();
    if (!context.patientId) return;
    setBusy(true); setError("");
    try {
      const year = new Date().getFullYear();
      const filters = {
        devices: device,
        condition, sex,
        fromBirthday: `${year - Number(finalAge)}-01-01`,
        toBirthday: `${year - Number(initialAge)}-12-31`
      };
      const data = await getPlatformComparative(context, filters, visualization);
      setRows(data);
      setShown(visualization);
      if (!data.length) setError("Não há comparativos reais disponíveis.");
    } catch (e) {
      setRows([]);
      setError(e.message || "Não foi possível consultar os comparativos.");
    } finally { setBusy(false); }
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ fontSize: 20, fontWeight: "bold", color: "#11192A", mt: 1 }}>
        Plataforma — Comparativos
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "end", mt: 3 }}>
        <DeviceSelect device={device} setDevice={(v) => {
          setDevice(v); setRows([]); setError("");
        }} />
        {device !== "Pitaco 3.0" && (
          <Box component="form" onSubmit={apply}
            sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "end" }}>
            <Box sx={{ width: 120 }}>
              <SelectComponent title="Condição" initialKey={condition}
                handleChangeCallBack={setCondition} items={[
                  { key: "Healthy", value: "Saudável" },
                  { key: "Obstructive", value: "Obstrutivo" },
                  { key: "Restrictive", value: "Restritivo" }
                ]} />
            </Box>
            <Box sx={{ width: 125 }}>
              <SelectComponent title="Sexo" initialKey={sex}
                handleChangeCallBack={setSex} items={[
                  { key: "Male", value: "Masculino" },
                  { key: "Female", value: "Feminino" }
                ]} />
            </Box>
            <TextField label="Idade inicial" size="small" type="number"
              value={initialAge} onChange={(e) => setInitialAge(e.target.value)}
              inputProps={{ min: 1, max: 120 }} sx={{ ...inputSx, width: 110, minWidth: 110 }} />
            <TextField label="Idade final" size="small" type="number"
              value={finalAge} onChange={(e) => setFinalAge(e.target.value)}
              inputProps={{ min: 1, max: 120 }} sx={{ ...inputSx, width: 110, minWidth: 110 }} />
            <Box sx={{ width: 190 }}>
              <SelectComponent title="Visualização" initialKey={visualization}
                handleChangeCallBack={setVisualization} items={visuals} />
            </Box>
            <Button type="submit" variant="contained" disabled={!context.patientId || busy}
              sx={{ bgcolor: "#1e2b48", height: 40 }}>Filtrar</Button>
          </Box>
        )}
      </Box>
      {device === "Pitaco 3.0" ? (
        <Pitaco3ComparativePanel key={context.patientId || "no-patient"}
          patientId={context.patientId} />
      ) : (
        <Box sx={{ mt: 4 }}>
          {error && <Typography role="alert" color="error">{error}</Typography>}
          {rows.length > 0 && (
            <PlatformGraphComparative graphData={rows} viewType={shown === "expiratory_peak" ? 1 : 2}
              tableLegend_Y={legend[shown][0]}
              unitOfMeasurement={legend[shown][1]}
              tableLegend_X="Medidas reais do paciente selecionado" />
          )}
          {!rows.length && !error && (
            <Typography color="text.secondary">Selecione os filtros e clique em Filtrar.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
