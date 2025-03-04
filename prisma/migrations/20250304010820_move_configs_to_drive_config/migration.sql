-- First, update driveConfig to include the existing values
UPDATE "Institution"
SET "driveConfig" = jsonb_set(
  COALESCE("driveConfig"::jsonb, '{}'::jsonb),
  '{maxMicrophones}',
  to_jsonb("maxMicrophones")
);

UPDATE "Institution"
SET "driveConfig" = jsonb_set(
  "driveConfig"::jsonb,
  '{membershipText}',
  to_jsonb("membershipText")
);

UPDATE "Institution"
SET "driveConfig" = jsonb_set(
  "driveConfig"::jsonb,
  '{imageRightsText}',
  to_jsonb("imageRightsText")
);

UPDATE "Institution"
SET "driveConfig" = jsonb_set(
  "driveConfig"::jsonb,
  '{bibleVersions}',
  to_jsonb("bibleVersions")
);

-- Then drop the columns
ALTER TABLE "Institution" DROP COLUMN "maxMicrophones";
ALTER TABLE "Institution" DROP COLUMN "membershipText";
ALTER TABLE "Institution" DROP COLUMN "imageRightsText";
ALTER TABLE "Institution" DROP COLUMN "bibleVersions";
