// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { verifyChecksum } from '../data/security/checksum';
describe('wire checksum', () => {
  it('checks the exact transmitted UTF-8 bytes and rejects modification', async () => {
    const content = JSON.stringify({
      type: 'live_data',
      session_id: 'ses_A',
      value: 0.000123,
    });
    const bytes = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(content),
    );
    const checksum = Array.from(new Uint8Array(bytes), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    expect(await verifyChecksum(content, checksum)).toBe(true);
    expect(
      await verifyChecksum(content.replace('0.000123', '0.000124'), checksum),
    ).toBe(false);
    expect(await verifyChecksum(content, '')).toBe(false);
  });
});
