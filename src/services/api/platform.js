import axios from "axios";
import { BaseUrl } from "../../providers/_config";
import { getTokenParameters } from "../../providers/sessionStorage";
import { comparativeData } from "../comparativeData";

export async function getPlatformComparative(context, filters, visualization) {
  const gameToken = getTokenParameters("gameToken");
  const response = await axios.get(`${BaseUrl()}/plataforms/statistics`, {
    params: filters, headers: { GameToken: gameToken }
  });
  if (!response.data || response.data.success !== true ||
      !Array.isArray(response.data.data)) {
    throw new Error("A API não retornou dados comparativos válidos.");
  }
  return comparativeData(response.data.data, context.patientId, visualization);
}
