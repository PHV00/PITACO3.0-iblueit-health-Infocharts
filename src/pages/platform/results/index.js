/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import DeviceSelect from "../../../components/device-select";
import DateInterval from "../../../components/date-interval";
import SelectComponent from "../../../components/select";
import CalibrationGraph from "../../../components/calibration-graph";
import MicroCard from "../../../components/micro-card";
import Pitaco3ResultsPanel from "../../../components/pitaco3/Pitaco3ResultsPanel";
import { useMyContext } from "../../../providers/MyContext";
import { fetchResults, fetchPointsAndLevelsAndPlays } from "../../../services/api/result";

export default function ResultPage() {
  const context = useMyContext();
  const [device, setDevice] = useState("Pitaco");
  const [visualization, setVisualization] = useState("score");
  const [shown, setShown] = useState("score");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [resultData, setResultData] = useState([]);
  const [warning, setWarning] = useState("Selecione os filtros desejados.");
  const [cards, setCards] = useState([]);

  useEffect(() => {
    let alive = true;
    setResultData([]);
    setWarning("Selecione os filtros desejados.");
    setDevice("Pitaco");
    if (!context.patientId) return () => { alive = false; };
    fetchPointsAndLevelsAndPlays(context.patientId)
      .then((values) => { if (alive) setCards(values); })
      .catch((err) => { if (alive) context.addNotification("error", err.message); });
    return () => { alive = false; };
  }, [context.patientId]);

  async function apply() {
    if (!context.patientId) return;
    if (device === "Pitaco 3.0") {
      setReloadKey((key) => key + 1);
      return;
    }
    context.setLoading(true);
    try {
      const rows = await fetchResults(context.patientId, device, visualization, { dataIni, dataFim });
      setResultData(rows);
      setShown(visualization);
      setWarning(rows.length ? "" : "Não existe histórico para os filtros selecionados.");
    } catch (err) {
      setResultData([]);
      setWarning(err.message || "Não foi possível consultar os resultados.");
      context.addNotification("error", err.message || "Erro na consulta.");
    } finally {
      context.setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ fontSize: 20, fontWeight: "bold", mt: 1 }}>
        Resultados na plataforma
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 3 }}>
        {cards.map((item) => <MicroCard key={item.title} title={item.title} value={item.value} />)}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 3, mb: 3, alignItems: "end" }}>
        <DeviceSelect device={device} setDevice={(next) => {
          setDevice(next); setResultData([]);
        }} />
        {device !== "Pitaco 3.0" && (
          <Box sx={{ width: 200 }}>
            <SelectComponent title="Visualização" initialKey={visualization}
              handleChangeCallBack={setVisualization}
              items={[
                { key: "score", value: "Pontuação" },
                { key: "maxExpFlow", value: "Pico Expiratório" },
                { key: "maxInsFlow", value: "Pico Inspiratório" },
                { key: "scoreRatio", value: "Razão" }
              ]} />
          </Box>
        )}
        <DateInterval handleStartDateChangeCallBack={setDataIni}
          handleFinalDateChangeCallBack={setDataFim} />
        <Button variant="contained" onClick={apply} disabled={!context.patientId}
          sx={{ bgcolor: "#1e2b48", height: 40 }}>Filtrar</Button>
      </Box>
      {device === "Pitaco 3.0" ? (
        <Pitaco3ResultsPanel patientId={context.patientId}
          dataIni={dataIni} dataFim={dataFim} reloadKey={reloadKey} />
      ) : resultData.length ? (
        <CalibrationGraph data={resultData} exercise={shown} />
      ) : (
        <Typography color="text.secondary">{warning}</Typography>
      )}
    </Box>
  );
}
