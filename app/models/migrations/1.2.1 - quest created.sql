ALTER TABLE quests ADD COLUMN created TIMESTAMP NULL DEFAULT NOW();

UPDATE quests SET created = published;
