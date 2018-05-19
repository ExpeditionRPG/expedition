ALTER TABLE quests ADD COLUMN theme VARCHAR(128) DEFAULT 'base';
UPDATE quests SET theme = 'base';
