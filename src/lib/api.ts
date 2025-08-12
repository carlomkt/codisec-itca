export async function fetchJSON<T>(url: string, fallbackKey?: string, fallbackDefault?: T): Promise<T> {
  try {
    const res = await fetch(url);
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
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    if (fallbackKey) {
      localStorage.setItem(fallbackKey, JSON.stringify(body));
    }
  }
}