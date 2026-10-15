import { existsSync } from "node:fs";

export const loadEnvFiles = (files: readonly string[] = [".env.local", ".env"]) => {
  for (const file of files) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
};
