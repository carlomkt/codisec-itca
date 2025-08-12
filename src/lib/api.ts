export const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

function withBase(url: string) {
  if (!url) return url;
  return url.startsWith('/') ? `${API_BASE}${url}` : url;
}

export async function fetchJSON<T>(url: string, fallbackKey?: string, fallbackDefault?: T): Promise<T> {
  try {
    const res = await fetch(withBase(url), { headers: authHeaders() });
    if (!res.ok) throw new Error('Bad status');
    return (await res.json()) as T;
  } catch {
    if (fallbackKey) {
      try {
        const raw = localStorage.getItem(fallbackKey);
        return raw ? (JSON.parse(raw) as T) : (fallbackDefault as T);
      } catch {
        return fallbackDefault as T;
      }
    }
    throw new Error('fetch failed');
  }
}

export async function postJSON<T>(url: string, body: T, fallbackKey?: string) {
  try {
    await fetch(withBase(url), { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) });
  } catch {
    if (fallbackKey) {
      localStorage.setItem(fallbackKey, JSON.stringify(body));
    }
  }
}

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function ensureDevToken() {
  if (localStorage.getItem('authToken')) return;
  try {
    const res = await fetch(withBase('/api/dev-token'));
    if (res.ok) {
      const data = await res.json();
      if (data?.token) localStorage.setItem('authToken', data.token);
    }
  } catch {}
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(withBase(path), { ...init, headers: { ...init?.headers, ...authHeaders() } });
}