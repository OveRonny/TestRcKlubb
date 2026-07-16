const accessTokenKey = 'rcklubb_access_token';
const refreshTokenKey = 'rcklubb_refresh_token';

export function getAccessToken() {
  return sessionStorage.getItem(accessTokenKey);
}

export function saveTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem(accessTokenKey, accessToken);
  sessionStorage.setItem(refreshTokenKey, refreshToken);
}

export function clearTokens() {
  sessionStorage.removeItem(accessTokenKey);
  sessionStorage.removeItem(refreshTokenKey);
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
