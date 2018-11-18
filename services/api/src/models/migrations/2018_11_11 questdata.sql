CREATE TABLE IF NOT EXISTS "questdata" ("id" VARCHAR(255) NOT NULL , "userid" VARCHAR(255) DEFAULT '' , "created" TIMESTAMP WITH TIME ZONE , "data" TEXT, "notes" TEXT, "metadata" TEXT, "tombstone" TIMESTAMP WITH TIME ZONE DEFAULT NULL, PRIMARY KEY ("id","userid","created"));
