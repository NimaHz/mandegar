ALTER TABLE "warranty_policies" ALTER COLUMN "name" SET DATA TYPE jsonb USING jsonb_build_object('fa', "name", 'en', "name");--> statement-breakpoint
UPDATE "warranty_policies" SET "name" = jsonb_build_object('fa', 'مراقبت ماندگار ۱۸', 'en', "name"->>'en') WHERE "name"->>'en' = 'Mandegar Care 18';--> statement-breakpoint
UPDATE "warranty_policies" SET "name" = jsonb_build_object('fa', 'مراقبت ماندگار پلاس ۳۰', 'en', "name"->>'en') WHERE "name"->>'en' = 'Mandegar Care Plus 30';
