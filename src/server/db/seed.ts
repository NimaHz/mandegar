import { closeDb, getDb } from "@/server/db/client";
import { type NewSetting, settings } from "@/server/db/schema";
import { loadEnvFiles } from "@/server/load-env-files";

const defaultSettings: NewSetting[] = [{ key: "maintenance", value: { enabled: false } }];

const seed = async () => {
  loadEnvFiles();
  const inserted = await getDb()
    .insert(settings)
    .values(defaultSettings)
    .onConflictDoNothing()
    .returning({ key: settings.key });
  process.stdout.write(`Seeded ${inserted.length} setting(s)\n`);
};

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
