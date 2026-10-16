import fileSystemCache from "next/dist/server/lib/incremental-cache/file-system-cache.js";
import { tagsManifest } from "next/dist/server/lib/incremental-cache/tags-manifest.external.js";
import postgres from "postgres";

const FileSystemCache = fileSystemCache.default ?? fileSystemCache;
const RETRY_MS = 30_000;

let client;
let loaded = false;
let loading;
let retryAt = 0;

const database = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 10, onnotice: () => {} });
  return client;
};

const timeOf = (value) => (value instanceof Date ? value.getTime() : 0);

const remember = (rows) => {
  for (const row of rows) {
    const entry = tagsManifest.get(row.tag) ?? {};
    tagsManifest.set(row.tag, {
      ...entry,
      stale: Math.max(entry.stale ?? 0, timeOf(row.stale_at)),
      expired: Math.max(entry.expired ?? 0, timeOf(row.expired_at)),
    });
  }
};

const loadExpirations = async () => {
  const sql = database();
  if (loaded || !sql || Date.now() < retryAt) return;
  loading ??= sql`select tag, stale_at, expired_at from cache_tag_expirations`
    .then((rows) => {
      remember(rows);
      loaded = true;
    })
    .catch((error) => {
      retryAt = Date.now() + RETRY_MS;
      console.error("Could not load cache tag expirations", error);
    })
    .finally(() => {
      loading = undefined;
    });
  await loading;
};

const dateOf = (time) => (typeof time === "number" && time > 0 ? new Date(time) : null);

const saveExpirations = async (tags) => {
  const sql = database();
  if (!sql || tags.length === 0) return;
  const rows = tags.map((tag) => {
    const entry = tagsManifest.get(tag) ?? {};
    return { tag, stale_at: dateOf(entry.stale), expired_at: dateOf(entry.expired) };
  });
  try {
    await sql`
      insert into cache_tag_expirations ${sql(rows)}
      on conflict (tag) do update
      set stale_at = excluded.stale_at, expired_at = excluded.expired_at
    `;
  } catch (error) {
    console.error("Could not save cache tag expirations", error);
  }
};

export default class PersistentTagsCache extends FileSystemCache {
  async get(...args) {
    await loadExpirations();
    return super.get(...args);
  }

  async revalidateTag(tags, durations) {
    await loadExpirations();
    await super.revalidateTag(tags, durations);
    await saveExpirations(typeof tags === "string" ? [tags] : [...new Set(tags)]);
  }
}
