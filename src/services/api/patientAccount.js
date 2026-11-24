/* eslint-disable no-throw-literal */
import axios from 'axios';

import { BaseUrl } from '../../providers/_config';
import { getTokenParameters, getAuthorizationHeaders } from '../../providers/sessionStorage';

import { extractMessage } from '../../components/notification';


const getPatientAccount = async (context) => {
  context.setLoading(true);
  try {
    if(context.patientId){
      const GameToken = getTokenParameters('gameToken');
      const result = await axios.get(`${BaseUrl()}/pacients/${context.patientId}/account`, { headers: { GameToken, ...getAuthorizationHeaders() } });
      return result.data.data
    }
    context.addNotification('error', 'Nenhum paciente selecionados')
    return null;
  } catch (error) {
    context.addNotification('error', extractMessage(error, ''));
    throw 'erro';
  } finally {
    context.setLoading(false);
  }
}

const resetPatientPassword = async (context, patientId, password) => {
  context.setLoading(true);
  try {
    const GameToken = getTokenParameters('gameToken');
    await axios.post(
      `${BaseUrl()}/pacients/${encodeURIComponent(patientId)}/account/reset-password`,
      { password },
      { headers: { GameToken, ...getAuthorizationHeaders() } }
    );
    context.addNotification('success', 'Senha atualizada. Sessões anteriores foram encerradas.');
  } catch (error) {
    context.addNotification('error', extractMessage(error, 'Não foi possível atualizar a senha.'));
    throw error;
  } finally {
    context.setLoading(false);
  }
};

export {
  getPatientAccount,
  resetPatientPassword,
};