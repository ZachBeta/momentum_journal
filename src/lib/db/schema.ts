export const schema = `
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entry_versions (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  change_type TEXT NOT NULL,
  diff TEXT,
  FOREIGN KEY (entry_id) REFERENCES journal_entries(id)
);

CREATE TABLE IF NOT EXISTS entry_metadata (
  entry_id TEXT PRIMARY KEY,
  tags TEXT,
  word_count INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 0,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entry_id) REFERENCES journal_entries(id)
);
`;
