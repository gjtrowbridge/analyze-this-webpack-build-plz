import { Migration } from './types'
import type { Database } from 'better-sqlite3'

export const createBasicTablesMigration: Migration = {
  name: '2025-03-20_09-25-create-basic-tables',
  up: (db: Database) => {
    db.exec(`
  CREATE TABLE IF NOT EXISTS files(
      id INTEGER,
      original_name TEXT NOT NULL,
      user_provided_name TEXT NOT NULL,
      uploaded_at INTEGER,
      done_processing INTEGER NOT NULL,
      
      PRIMARY KEY(id ASC),
      UNIQUE(original_name, uploaded_at)
  ) STRICT
`)
    db.exec(`
  CREATE TABLE IF NOT EXISTS modules(
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
`)
    db.exec(`
  CREATE TABLE IF NOT EXISTS chunks(
      id INTEGER,
      chunk_id TEXT,
      chunk_name TEXT,
      raw_json TEXT NOT NULL,
      file_id INTEGER NOT NULL,

      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(chunk_id, chunk_name, file_id)
  ) STRICT
`)
  },
  down: (db: Database) => {
    db.exec(`DROP TABLE IF EXISTS modules`);
    db.exec(`DROP TABLE IF EXISTS chunks`);
    db.exec(`DROP TABLE IF EXISTS files`);
  }
}