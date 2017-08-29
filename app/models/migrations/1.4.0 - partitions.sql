ALTER TABLE quests ADD COLUMN partition VARCHAR(32);
UPDATE quests SET partition = 'expedition-public';
ALTER TABLE quests DROP CONSTRAINT quests_pkey;
ALTER TABLE quests ADD PRIMARY KEY (partition, id);

ALTER TABLE feedback ADD COLUMN partition VARCHAR(32);
UPDATE feedback SET partition = 'expedition-public';
ALTER TABLE feedback DROP CONSTRAINT feedback_pkey;
ALTER TABLE feedback ADD PRIMARY KEY (partition, questid, userid);
