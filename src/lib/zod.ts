import { config } from "zod";

if (typeof window !== "undefined") config({ jitless: true });

export * from "zod";
