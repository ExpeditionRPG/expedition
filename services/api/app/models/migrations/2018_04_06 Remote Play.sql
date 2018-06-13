CREATE TABLE sessionclients (
  session BIGINT,
  client VARCHAR(255),
  secret VARCHAR(32),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE sessions (
  id BIGINT,
  secret VARCHAR(32),
  eventCounter INT,
  locked BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE events (
  session BIGINT,
  id BIGINT,
  timestamp TIMESTAMP DEFAULT NOW(),
  client VARCHAR(255),
  instance VARCHAR(255),
  type VARCHAR(32),
  json TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
