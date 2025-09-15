// Centralized NocoDB client (server-side only)
// NOTE: Keep this file imported ONLY from server code (e.g., route handlers under app/api)

const NOCO_BASE_URL = process.env.NOCO_BASE_URL || 'https://white-nocodb.5zd9ii.easypanel.host';
const DB_TOKEN = process.env.NOCO_API_TOKEN || process.env.DB_TOKEN || '';

const DEFAULT_TIMEOUT_MS = 10000; // 10s
const DEFAULT_RETRIES = 2; // number of retries on network error/5xx

function mergeHeaders(base: HeadersInit = {}, extra: HeadersInit = {}): HeadersInit {
  const baseObj = new Headers(base);
  const extraObj = new Headers(extra);
  extraObj.forEach((value, key) => baseObj.set(key, value));
  return baseObj;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  // @ts-ignore attach signal if this is a fetch init wrapper
  (promise as any).signal = controller.signal;
  return promise.finally(() => clearTimeout(timeout));
}

async function doFetch(url: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES): Promise<Response> {
  const headers = mergeHeaders(
    {
      'Content-Type': 'application/json',
      'xc-token': DB_TOKEN,
    },
    init.headers || {}
  );

  let lastError: unknown = undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { ...init, headers, signal: controller.signal });
      clearTimeout(timeout);

      // Retry on 5xx
      if (res.status >= 500 && res.status <= 599 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      // Retry on fetch/network errors
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown fetch error');
}

async function request(pathOrUrl: string, init: RequestInit = {}, absolute = false): Promise<Response> {
  const url = absolute ? pathOrUrl : `${NOCO_BASE_URL}${pathOrUrl}`;
  return doFetch(url, init);
}

async function getJson<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await request(path, { ...init, method: 'GET' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NocoDB GET failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

async function getJsonAbsolute<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await request(url, { ...init, method: 'GET' }, true);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NocoDB GET (abs) failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

async function postJson<T = any>(path: string, body: unknown, init: RequestInit = {}): Promise<T> {
  const res = await request(path, { ...init, method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NocoDB POST failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

async function patchJson<T = any>(path: string, body: unknown, init: RequestInit = {}): Promise<T> {
  const res = await request(path, { ...init, method: 'PATCH', body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NocoDB PATCH failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) usp.set(k, String(v));
  });
  return usp.toString();
}

export const nocoClient = {
  baseUrl: NOCO_BASE_URL,
  request,
  getJson,
  getJsonAbsolute,
  postJson,
  patchJson,
  buildQuery,
  // Helpers for common NocoDB paths
  listRecords<T = any>(tableId: string, query: Record<string, any> = {}): Promise<{ list: T[]; pageInfo?: any }> {
    const q: Record<string, any> = { limit: 1000, shuffle: 0, offset: 0, ...query };
    const qs = buildQuery(q);
    return getJson(`/api/v2/tables/${tableId}/records${qs ? `?${qs}` : ''}`);
  },
  updateRecords<T = any>(tableId: string, body: unknown): Promise<T> {
    return patchJson(`/api/v2/tables/${tableId}/records`, body);
  },
  updateRecordById<T = any>(tableId: string, recordId: string, body: unknown): Promise<T> {
    return patchJson(`/api/v2/tables/${tableId}/records/${recordId}`, body);
  },
};

export type NocoListResponse<T> = { list: T[]; pageInfo?: any };