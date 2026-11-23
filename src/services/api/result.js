import axios from "axios";
import moment from "moment";
import { BaseUrl } from "../../providers/_config";
import { getTokenParameters } from "../../providers/sessionStorage";

export const fetchResults = async (patientId, device, visualization, dates = {}) => {
  const gameToken = getTokenParameters("gameToken");
  const response = await axios.get(
    `${BaseUrl()}/pacients/${encodeURIComponent(patientId)}/plataforms/statistics`,
    {
      headers: { GameToken: gameToken },
      params: {
        sort: "asc", devices: device,
        ...(dates.dataIni ? { dataIni: dates.dataIni } : {}),
        ...(dates.dataFim ? { dataFim: dates.dataFim } : {})
      }
    }
  );
  if (!response.data || response.data.success !== true ||
      !Array.isArray(response.data.data)) throw new Error("Resposta de resultados inválida.");
  return response.data.data.map((r) => ({
    date: r.playFinish ? moment(r.playFinish).format("DD/MM/YY") : "",
    value: typeof r[visualization] === "number" ? r[visualization] : null
  }));
};

export const fetchPointsAndLevelsAndPlays = async (patientId) => {
  const gameToken = getTokenParameters("gameToken");
  const response = await axios.get(
    `${BaseUrl()}/pacients/${encodeURIComponent(patientId)}`,
    { headers: { GameToken: gameToken } }
  );
  const data = response.data && response.data.data;
  if (!data) throw new Error("Paciente não encontrado.");
  return [
    { value: data.accumulatedScore ?? "—", title: "Pontuação acumulada" },
    { value: data.unlockedLevels ?? "—", title: "Níveis desbloqueados" },
    { value: data.playSessionsDone ?? "—", title: "Seções jogadas" }
  ];
};
