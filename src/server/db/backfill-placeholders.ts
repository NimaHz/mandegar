import { and, eq, isNull } from "drizzle-orm";

import { closeDb, getDb } from "@/server/db/client";
import { media } from "@/server/db/schema";
import { loadEnvFiles } from "@/server/load-env-files";
import { encodePlaceholder } from "@/server/modules/media/service";
import { getStorage } from "@/server/storage";

const log = (message: string) => process.stdout.write(`${message}\n`);

const readAll = async (key: string) => {
  const file = await (await getStorage()).get(key, null);
  return file ? new Uint8Array(await new Response(file.body).arrayBuffer()) : null;
};

const backfill = async () => {
  loadEnvFiles();
  const db = getDb();
  const rows = await db
    .select({ id: media.id, storageKey: media.storageKey })
    .from(media)
    .where(and(eq(media.kind, "image"), isNull(media.placeholder)));
  let done = 0;
  for (const row of rows) {
    const bytes = await readAll(row.storageKey);
    if (!bytes) {
      log(`missing: ${row.storageKey}`);
      continue;
    }
    const placeholder = await encodePlaceholder(bytes).catch(() => null);
    if (!placeholder) {
      log(`undecodable: ${row.storageKey}`);
      continue;
    }
    await db.update(media).set({ placeholder }).where(eq(media.id, row.id));
    done += 1;
  }
  log(`placeholders: ${done} of ${rows.length}`);
};

backfill()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
