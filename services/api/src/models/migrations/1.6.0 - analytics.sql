CREATE TABLE analyticsevents (
  category VARCHAR(255),
  action VARCHAR(255),
  questid VARCHAR(255),
  userid VARCHAR(255),
  questversion INT,
  created TIMESTAMP DEFAULT NOW(),
  difficulty VARCHAR(32),
  platform VARCHAR(32),
  players INT,
  version VARCHAR(32)
);
