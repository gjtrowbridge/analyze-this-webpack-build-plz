CREATE TABLE files(
      id INTEGER,
      original_name TEXT NOT NULL,
      user_provided_name TEXT NOT NULL,
      uploaded_at INTEGER,
      done_processing INTEGER NOT NULL, modules_count INTEGER, chunks_count INTEGER, named_chunk_groups_count INTEGER, assets_count INTEGER,
      
      PRIMARY KEY(id ASC),
      UNIQUE(original_name, uploaded_at)
  ) STRICT
;
CREATE TABLE modules(
      id INTEGER,
      unique_key TEXT,
      
      module_id TEXT,
      module_identifier TEXT,
      raw_json TEXT NOT NULL,
      file_id INTEGER NOT NULL,

      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(unique_key, file_id)
  ) STRICT
;
CREATE TABLE chunks(
      id INTEGER,
      chunk_id TEXT,
      chunk_name TEXT,
      raw_json TEXT NOT NULL,
      file_id INTEGER NOT NULL,

      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(chunk_id, chunk_name, file_id)
  ) STRICT
;
CREATE TABLE assets(
      id INTEGER,
      
      name TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      file_id INTEGER NOT NULL,
      
      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(name, file_id)
  ) STRICT
;
CREATE TABLE named_chunk_groups(
      id INTEGER,
      
      name TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      file_id INTEGER NOT NULL,
      
      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(name, file_id)
  ) STRICT
;
