import axios from 'axios';
import { BaseUrl } from '../../providers/_config';
import { getAuthorizationHeaders } from '../../providers/sessionStorage';

// Only add the session to our API origin and path; never attach it to third-party URLs.
axios.interceptors.request.use((config) => {
  if (!config || !config.url) return config;
  try {
    const api = new URL(BaseUrl(), window.location.origin);
    const target = new URL(config.url, window.location.origin);
    const apiPath = api.pathname.replace(/\/$/, '');
    if (target.origin === api.origin &&
        (target.pathname === apiPath || target.pathname.startsWith(apiPath + '/'))) {
      config.headers = { ...(config.headers || {}), ...getAuthorizationHeaders() };
    }
  } catch (_) { /* Invalid URL: leave the request untouched. */ }
  return config;
});
