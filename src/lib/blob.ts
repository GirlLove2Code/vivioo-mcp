import { put, list, del } from '@vercel/blob';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Sanitize keys to prevent path traversal
function sanitizeKey(key: string): string {
  let sanitized = key.replace(/[^a-zA-Z0-9\-_.\/]/g, '');
  // M1 fix: reject path traversal attempts
  sanitized = sanitized.replace(/\.\./g, '');
  // Normalize double slashes
  sanitized = sanitized.replace(/\/+/g, '/');
  return sanitized;
}

// Local fallback directory for development
const LOCAL_BLOB_DIR = join(process.cwd(), '.blob-local');

function ensureLocalDir(path: string): void {
  const dir = join(LOCAL_BLOB_DIR, path.substring(0, path.lastIndexOf('/')));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export async function blobWrite(path: string, data: object): Promise<string> {
  const key = sanitizeKey(path);
  const body = JSON.stringify(data, null, 2);

  if (BLOB_TOKEN) {
    const result = await put(key, body, {
      // Vercel Blob only supports 'public' — URLs contain random tokens so aren't guessable.
      // Contact emails in submissions/concerns are only accessible if you know the exact blob URL.
      access: 'public',
      token: BLOB_TOKEN,
      contentType: 'application/json',
    });
    return result.url;
  }

  // Local fallback
  ensureLocalDir(key);
  const localPath = join(LOCAL_BLOB_DIR, key);
  writeFileSync(localPath, body, 'utf-8');
  return `local://${localPath}`;
}

export async function blobRead(path: string): Promise<object | null> {
  const key = sanitizeKey(path);

  if (BLOB_TOKEN) {
    try {
      const blobs = await list({ prefix: key, token: BLOB_TOKEN });
      if (blobs.blobs.length === 0) return null;
      const response = await fetch(blobs.blobs[0].url);
      return await response.json() as object;
    } catch {
      return null;
    }
  }

  // Local fallback
  const localPath = join(LOCAL_BLOB_DIR, key);
  if (!existsSync(localPath)) return null;
  return JSON.parse(readFileSync(localPath, 'utf-8'));
}

export async function blobList(prefix: string): Promise<string[]> {
  const sanitized = sanitizeKey(prefix);

  if (BLOB_TOKEN) {
    const blobs = await list({ prefix: sanitized, token: BLOB_TOKEN });
    return blobs.blobs.map(b => b.pathname);
  }

  // Local fallback
  const dir = join(LOCAL_BLOB_DIR, sanitized);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map(f => `${sanitized}/${f}`);
}

export async function blobDelete(path: string): Promise<void> {
  const key = sanitizeKey(path);

  if (BLOB_TOKEN) {
    const blobs = await list({ prefix: key, token: BLOB_TOKEN });
    for (const blob of blobs.blobs) {
      await del(blob.url, { token: BLOB_TOKEN });
    }
    return;
  }

  // Local fallback - skip deletion for safety
}
