ALTER TABLE quests ADD COLUMN expansionfuture BOOLEAN DEFAULT FALSE;
UPDATE quests SET expansionfuture = FALSE;
