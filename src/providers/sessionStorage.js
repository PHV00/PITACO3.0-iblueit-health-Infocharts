// Transitional user session state. The server is authoritative for permissions.
const KEY = 'userCredentials';
const read = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed : null;
  } catch (_) {
    sessionStorage.removeItem(KEY);
    return null;
  }
};
const saveAuthenticationData = (response) => {
  const value = response && response.data && response.data.data;
  if (value && typeof value.sessionToken === 'string' && value.sessionToken) {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } else {
    sessionStorage.removeItem(KEY);
  }
};
const validateUserCredentials = (data) => Boolean(
  data && data.userId && data.role && data.sessionToken &&
  typeof data.sessionToken === 'string' && data.authExpirationTime &&
  Number.isFinite(Date.parse(data.authExpirationTime)) &&
  Date.parse(data.authExpirationTime) > Date.now()
);
const isAuthenticated = () => validateUserCredentials(read());
const getTokenParameters = (parameter = null) => {
  const data = read();
  if (!data) return null;
  return parameter ? (data[parameter] ?? null) : data;
};
const getAuthorizationHeaders = () => {
  const token = getTokenParameters('sessionToken');
  return token && isAuthenticated() ? { Authorization: `Bearer ${token}` } : {};
};
const updateAuthenticationData = (parameter, value) => {
  const data = read();
  if (!data || !parameter) return;
  data[parameter] = value;
  sessionStorage.setItem(KEY, JSON.stringify(data));
};
const removerAuthenticationData = () => sessionStorage.removeItem(KEY);
export {
  saveAuthenticationData, removerAuthenticationData, isAuthenticated,
  getTokenParameters, getAuthorizationHeaders, updateAuthenticationData,
  validateUserCredentials
};
