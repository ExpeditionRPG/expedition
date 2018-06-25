ALTER TABLE quests ADD COLUMN horrorexpansion BOOLEAN DEFAULT FALSE;
UPDATE quests SET horrorexpansion = FALSE;
