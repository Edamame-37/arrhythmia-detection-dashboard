export function readStored<T>(
  storage: Storage,
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    if (validate && !validate(value)) return fallback;
    return value as T;
  } catch {
    storage.removeItem(key);
    return fallback;
  }
}
export const identityChanged = () =>
  window.dispatchEvent(new Event('ecg_identity_changed'));
