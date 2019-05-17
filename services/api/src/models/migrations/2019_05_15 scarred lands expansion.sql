ALTER TABLE quests ADD COLUMN expansionscarredlands BOOLEAN DEFAULT FALSE;
UPDATE quests SET expansionscarredlands = FALSE;
