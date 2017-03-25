CREATE TABLE feedback (
  questid VARCHAR(255) NOT NULL,
  userid VARCHAR(255) NOT NULL,
  PRIMARY KEY(questid, userid),

  created TIMESTAMP NULL DEFAULT NOW(),
  rating INT,
  text VARCHAR(2048),
  email VARCHAR(255),
  name VARCHAR(255),
  difficulty VARCHAR(32),
  platform VARCHAR(32),
  players INT,
  version VARCHAR(32)
);
