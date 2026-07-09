ALTER TABLE "ResourceRecommendation"
ADD COLUMN "matchedPreferences" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
