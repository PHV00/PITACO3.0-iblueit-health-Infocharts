import {
  saveAuthenticationData, isAuthenticated, getTokenParameters,
  getAuthorizationHeaders, removerAuthenticationData
} from './sessionStorage';

const validResponse = (expiresAt) => ({ data: { data: {
  userId: 'test-admin', role: 'Administrator',
  gameToken: 'test-account-token',
  sessionToken: 'a'.repeat(64),
  authExpirationTime: expiresAt
} } });

beforeEach(() => sessionStorage.clear());

test('session token is used for backend authorization before expiry', () => {
  saveAuthenticationData(validResponse(new Date(Date.now() + 60000).toISOString()));
  expect(isAuthenticated()).toBe(true);
  expect(getTokenParameters('gameToken')).toBe('test-account-token');
  expect(getAuthorizationHeaders()).toEqual({
    Authorization: `Bearer ${'a'.repeat(64)}`
  });
});
test('expired sessions cannot authorize requests', () => {
  saveAuthenticationData(validResponse(new Date(Date.now() - 60000).toISOString()));
  expect(isAuthenticated()).toBe(false);
  expect(getAuthorizationHeaders()).toEqual({});
});
test('legacy login without session token is not treated as authenticated', () => {
  saveAuthenticationData({ data: { data: {
    userId: 'old', gameToken: 'legacy', authExpirationTime: new Date(Date.now() + 60000)
  } } });
  expect(isAuthenticated()).toBe(false);
});
test('malformed session storage fails closed', () => {
  sessionStorage.setItem('userCredentials', '{bad');
  expect(isAuthenticated()).toBe(false);
  expect(getTokenParameters('sessionToken')).toBe(null);
});
test('logout removes only I Blue It session data', () => {
  sessionStorage.setItem('unrelated', 'keep');
  saveAuthenticationData(validResponse(new Date(Date.now() + 60000).toISOString()));
  removerAuthenticationData();
  expect(getTokenParameters()).toBe(null);
  expect(sessionStorage.getItem('unrelated')).toBe('keep');
});
