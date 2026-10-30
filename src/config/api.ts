import { supabase } from './supabaseClient';
import { API_URL } from './env';
import { readStored, identityChanged } from '../core/utils/storage';
import type { ImpersonationContext } from '../core/types/apiTypes';
export class ApiError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
export const getImpersonation = () =>
  readStored<ImpersonationContext | null>(
    sessionStorage,
    'ecg_impersonation',
    null,
  );
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const base = new URL(API_URL || '/', window.location.origin);
  const url = new URL(
    endpoint.startsWith('http')
      ? endpoint
      : base.href.replace(/\/$/, '') + '/' + endpoint.replace(/^\//, ''),
  );
  if (url.origin !== base.origin)
    throw new ApiError(400, 'Untrusted API origin');
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw new ApiError(401, 'Sesi autentikasi tidak tersedia');
  const headers = new Headers(options.headers);
  if (session?.access_token)
    headers.set('Authorization', 'Bearer ' + session.access_token);
  else headers.delete('Authorization');
  const impersonation = getImpersonation();
  if (impersonation)
    headers.set('X-Impersonation-Id', impersonation.impersonation_id);
  if (typeof options.body === 'string' && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json');
  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
    credentials: 'omit',
  });
  if (!response.ok) {
    const details = await response
      .clone()
      .json()
      .catch(() => ({}));
    throw new ApiError(
      response.status,
      details.message || 'Permintaan gagal (' + response.status + ')',
    );
  }
  return response;
}
export async function apiJson<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return (await fetchWithAuth(endpoint, options)).json();
}
export async function beginImpersonation(context: ImpersonationContext) {
  sessionStorage.setItem('ecg_impersonation', JSON.stringify(context));
  identityChanged();
}
export async function endImpersonation() {
  const context = getImpersonation();
  try {
    if (context)
      await fetchWithAuth('/api/impersonation/' + context.impersonation_id, {
        method: 'DELETE',
      });
  } finally {
    sessionStorage.removeItem('ecg_impersonation');
    identityChanged();
  }
}
export const getPhotoUrl = (
  input: string | null | undefined,
): string | undefined => {
  if (!input?.trim()) return undefined;
  if (input.startsWith('data:image/') || input.startsWith('blob:'))
    return input;
  const normalized = input.replace(/\\/g, '/');
  if (normalized.includes('/uploads/'))
    return '/uploads/' + normalized.split('/uploads/').at(-1);
  const url = new URL(normalized, window.location.origin);
  return url.origin === window.location.origin ? url.href : undefined;
};
export async function privatePhotoUrl(input: string): Promise<string> {
  const url = getPhotoUrl(input);
  if (!url) throw new Error('Foto tidak tersedia');
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (!url.includes('/uploads/')) return url;
  const path = '/uploads/' + url.split('/uploads/').at(-1);
  return URL.createObjectURL(await (await fetchWithAuth(path)).blob());
}
