CREATE TABLE "cache_tag_expirations" (
	"tag" text PRIMARY KEY NOT NULL,
	"stale_at" timestamp with time zone,
	"expired_at" timestamp with time zone
);--> statement-breakpoint
UPDATE "settings" SET "value" = jsonb_set("value", '{foundingYear}', to_jsonb(("value"->>'foundingYear')::integer - 621)) WHERE "key" = 'company' AND jsonb_typeof("value"->'foundingYear') = 'number' AND ("value"->>'foundingYear')::integer > 1700;
