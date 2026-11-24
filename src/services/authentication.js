
import axios from 'axios';

import { BaseUrl } from '../providers/_config';
import { saveAuthenticationData, removerAuthenticationData, getAuthorizationHeaders } from '../providers/sessionStorage';
import { extractMessage } from '../components/notification';


const postAuthentication = async (context, username, password) => {
  context.setLoading(true);
  try {
    const result = await axios.post(`${BaseUrl()}/login`, { username, password });
    saveAuthenticationData(result)
  } catch (error) {
    const errorMessage = extractMessage(error, 'Usuário ou senha incorretos');
    context.addNotification('error', errorMessage);
    throw new Error(errorMessage);
  } finally {
    context.setLoading(false);
  }
}


const postLogout = async () => {
  const headers = getAuthorizationHeaders();
  try {
    if (headers.Authorization) {
      await axios.post(`${BaseUrl()}/logout`, {}, { headers, timeout: 3000 });
    }
  } catch (_) {
    // Local session is invalidated regardless; remote token expires automatically.
  } finally {
    removerAuthenticationData();
  }
};

export {
  postAuthentication,
  postLogout,
};
