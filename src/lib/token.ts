// src/lib/token.ts
import crypto from 'crypto';

const SECRET = process.env.ADMIN_PASSWORD || 'tgdrive_sec_vault_2026_key';

export function generateDownloadToken(fileId: string, expiresInSeconds: number = 3600) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const data = `${fileId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex').substring(0, 16);
  return { token: signature, expires: expiresAt };
}

export function verifyDownloadToken(fileId: string, token: string, expires: number): { valid: boolean; reason?: string } {
  const now = Math.floor(Date.now() / 1000);
  if (now > expires) {
    return { valid: false, reason: "Link expired (1-hour time limit reached)" };
  }
  const data = `${fileId}:${expires}`;
  const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('hex').substring(0, 16);
  if (token !== expectedSig) {
    return { valid: false, reason: "Invalid or tampered token" };
  }
  return { valid: true };
}
