import { readFile } from "node:fs/promises";
import path from "node:path";

// Fetch JSON with a timeout. Returns null on any failure so callers can fall back to cache.
export async function fetchJson<T = unknown>(url: string, ms = 8000): Promise<T | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(ms),
      headers: { "User-Agent": "lantern-hackathon (demo)" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Read a cached snapshot from /data (created by scripts/cache-data.sh) for offline demos.
export async function readCache<T = unknown>(rel: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", rel), "utf8")) as T;
  } catch {
    return null;
  }
}
