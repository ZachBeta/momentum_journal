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

CREATE TABLE IF NOT EXISTS entry_diffs (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  position INTEGER NOT NULL,
  content TEXT,
  FOREIGN KEY (version_id) REFERENCES entry_versions(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_entry_versions_entry_id ON entry_versions(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_metadata_entry_id ON entry_metadata(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_diffs_version_id ON entry_diffs(version_id);
`;
