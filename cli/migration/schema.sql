CREATE TABLE files(
      id INTEGER,
      original_name TEXT NOT NULL,
      user_provided_name TEXT NOT NULL,
      uploaded_at INTEGER,
      done_processing INTEGER NOT NULL,
      
      PRIMARY KEY(id ASC),
      UNIQUE(original_name, uploaded_at)
  ) STRICT
;
CREATE TABLE modules(
      id INTEGER,
      module_id TEXT,
      module_identifier TEXT,
      raw BLOB NOT NULL,
      file_id INTEGER NOT NULL,

      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id),
      UNIQUE(module_id, module_identifier, file_id)
  ) STRICT
;
CREATE TABLE chunks(
      id INTEGER,
      chunk_id TEXT,
      chunk_name TEXT,
      raw BLOB NOT NULL,
      file_id INTEGER NOT NULL,

      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id),
      UNIQUE(chunk_id, chunk_name, file_id)
  ) STRICT
;
