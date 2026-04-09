// Tidal OAuth 2.0 PKCE Client
const TIDAL_CLIENT_ID = 'BZWWaUvVpiE8gRvy';
const TIDAL_AUTH_URL = 'https://login.tidal.com/oauth2/authorize';
const TIDAL_TOKEN_URL = 'https://login.tidal.com/oauth2/token';
const REDIRECT_URI = `${window.location.origin}/tidal-callback`;
const STORAGE_KEY = 'tidal_token';
const VERIFIER_KEY = 'tidal_pkce_verifier';

export interface TidalToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  obtained_at: number;
}

// --- PKCE helpers ---
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, length);
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  bytes.forEach(b => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// --- Public API ---
export async function startTidalOAuth() {
  const codeVerifier = generateRandomString(64);
  sessionStorage.setItem(VERIFIER_KEY, codeVerifier);

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlEncode(hashed);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TIDAL_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'r_usr w_usr',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  window.location.href = `${TIDAL_AUTH_URL}?${params.toString()}`;
}

export async function exchangeTidalCode(code: string): Promise<TidalToken> {
  const codeVerifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!codeVerifier) throw new Error('Missing PKCE verifier');

  // Use edge function to avoid CORS
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/tidal-proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'exchange_token',
      code,
      code_verifier: codeVerifier,
      redirect_uri: REDIRECT_URI,
      client_id: TIDAL_CLIENT_ID,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  const token: TidalToken = { ...data, obtained_at: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
  sessionStorage.removeItem(VERIFIER_KEY);
  return token;
}

export function getTidalToken(): TidalToken | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const token: TidalToken = JSON.parse(raw);
    // Check expiry (with 60s buffer)
    if (Date.now() > token.obtained_at + (token.expires_in - 60) * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function disconnectTidal() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
}

export function isTidalConnected(): boolean {
  return getTidalToken() !== null;
}

// --- API calls via edge function proxy ---
export async function searchTidalTracks(query: string): Promise<any[]> {
  const token = getTidalToken();
  if (!token) throw new Error('Not connected to Tidal');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/tidal-proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'search',
      access_token: token.access_token,
      query,
      client_id: TIDAL_CLIENT_ID,
    }),
  });

  if (!res.ok) throw new Error('Tidal search failed');
  const data = await res.json();
  return data.tracks || [];
}

export async function getTidalTrending(): Promise<any[]> {
  const token = getTidalToken();
  if (!token) throw new Error('Not connected to Tidal');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/tidal-proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'trending',
      access_token: token.access_token,
      client_id: TIDAL_CLIENT_ID,
    }),
  });

  if (!res.ok) throw new Error('Tidal trending failed');
  const data = await res.json();
  return data.tracks || [];
}
