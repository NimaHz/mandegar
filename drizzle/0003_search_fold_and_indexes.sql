ALTER TABLE "products" drop column "search_key";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "search_key" text GENERATED ALWAYS AS (regexp_replace(translate(lower(model_code || ' ' || (name->>'fa') || ' ' || (name->>'en') || ' ' || (tagline->>'fa') || ' ' || (tagline->>'en')), 'يىكةأإآ۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', 'ییکهااا01234567890123456789'), '[\u0009-\u000d\u0020\u00a0\u0640\u064b-\u065f\u0670\u1680\u2000-\u200a\u200c\u200e\u200f\u2028\u2029\u202f\u205f\u3000\ufeff-]', '', 'g')) STORED;--> statement-breakpoint
CREATE INDEX "products_search_trgm_idx" ON "products" USING gin ("search_key" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "ticket_messages_author_idx" ON "ticket_messages" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "ticket_messages_attachments_idx" ON "ticket_messages" USING gin ("attachment_media_ids");--> statement-breakpoint
CREATE INDEX "tickets_product_idx" ON "tickets" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "tickets_warranty_code_idx" ON "tickets" USING btree ("warranty_code_id");--> statement-breakpoint
CREATE INDEX "warranty_codes_policy_idx" ON "warranty_codes" USING btree ("policy_id");