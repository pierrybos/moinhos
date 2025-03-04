-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "bibleVersions" TEXT[] DEFAULT ARRAY['NVI', 'ACF', 'ARA']::TEXT[];
