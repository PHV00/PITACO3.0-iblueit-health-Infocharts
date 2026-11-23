import axios from "axios";
import { BaseUrl } from "../../providers/_config";
import { getTokenParameters } from "../../providers/sessionStorage";
import { localDayBoundary } from "../pitaco3Data";

const headers = () => ({ GameToken: getTokenParameters("gameToken") });
const data = (response) => {
  if (!response || !response.data || response.data.success !== true ||
      !Array.isArray(response.data.data)) {
    throw new Error("Resposta inválida da API do I Blue It.");
  }
  return response.data.data;
};

export async function getPitaco3Stages(patientId, filters = {}) {
  const response = await axios.get(
    `${BaseUrl()}/pacients/${encodeURIComponent(patientId)}/plataforms`,
    { headers: headers(), params: {
      devices: "Pitaco 3.0", ...filters,
      ...(filters.dataIni ? { dataIni: localDayBoundary(filters.dataIni) } : {}),
      ...(filters.dataFim ? { dataFim: localDayBoundary(filters.dataFim, true) } : {})
    } }
  );
  return data(response);
}
export async function getPitaco3Flow(flowId) {
  const response = await axios.get(
    `${BaseUrl()}/flowdata/${encodeURIComponent(flowId)}`,
    { headers: headers() }
  );
  return data(response)[0] || null;
}
export async function getPitaco3Summaries(patientId, filters = {}) {
  const response = await axios.get(
    `${BaseUrl()}/pacients/${encodeURIComponent(patientId)}/plataforms/physiology-summary`,
    { headers: headers(), params: filters }
  );
  return data(response);
}
// Paged collection to avoid silently dropping history past the first 100 stages.
// Defensive upper bound avoids loading unbounded clinical data into the browser.
async function collect(getPage, filters = {}, max = 500) {
  const rows = [];
  while (rows.length < max) {
    const limit = Math.min(100, max - rows.length);
    const next = await getPage({ ...filters, skip: rows.length, limit, sort: "asc" });
    rows.push(...next);
    if (next.length < limit) break;
  }
  return rows;
}
export const getPitaco3History = (patientId, filters) =>
  collect((page) => getPitaco3Stages(patientId, page), filters);
export const getPitaco3SummaryHistory = (patientId, filters) =>
  collect((page) => getPitaco3Summaries(patientId, page), filters);
