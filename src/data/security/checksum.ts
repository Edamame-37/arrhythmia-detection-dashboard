export async function verifyChecksum(
  content: unknown,
  expectedHash: string | undefined,
): Promise<boolean> {
  if (
    typeof content !== 'string' ||
    !expectedHash ||
    !/^[a-f0-9]{64}$/.test(expectedHash) ||
    !globalThis.crypto?.subtle
  )
    return false;
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(content),
  );
  const actual = Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('');
  return actual === expectedHash;
}
