CREATE TYPE "public"."media_scope" AS ENUM('library', 'ticket');--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_sha256_unique";--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "scope" "media_scope" DEFAULT 'library' NOT NULL;--> statement-breakpoint
UPDATE "media" SET "scope" = 'ticket'
WHERE "id" IN (SELECT unnest("attachment_media_ids") FROM "ticket_messages")
  AND NOT EXISTS (SELECT 1 FROM "product_images" WHERE "media_id" = "media"."id")
  AND NOT EXISTS (SELECT 1 FROM "brands" WHERE "logo_media_id" = "media"."id")
  AND NOT EXISTS (SELECT 1 FROM "categories" WHERE "image_media_id" = "media"."id")
  AND NOT EXISTS (SELECT 1 FROM "authors" WHERE "avatar_media_id" = "media"."id")
  AND NOT EXISTS (SELECT 1 FROM "posts" WHERE "cover_media_id" = "media"."id")
  AND NOT EXISTS (
    SELECT 1 FROM "hero_slides"
    WHERE "media"."id" IN ("image_media_id", "mobile_image_media_id")
  )
  AND NOT EXISTS (
    SELECT 1 FROM "products"
    WHERE "downloads" @> jsonb_build_array(jsonb_build_object('mediaId', "media"."id"))
  )
  AND NOT EXISTS (
    SELECT 1 FROM "guides"
    WHERE "video"->>'mediaId' = "media"."id"::text
      OR "video"->>'posterMediaId' = "media"."id"::text
      OR "steps" @> jsonb_build_array(jsonb_build_object('mediaId', "media"."id"))
  );--> statement-breakpoint
CREATE UNIQUE INDEX "media_library_sha256_idx" ON "media" USING btree ("sha256") WHERE scope = 'library';