import { Migration } from '../../../server/db/types'
import type { Database } from 'better-sqlite3'

export const createBasicTablesMigration: Migration = {
  up: (db: Database) => {
    db.exec(`
  CREATE TABLE IF NOT EXISTS files(
      id INTEGER,
      original_name TEXT NOT NULL,
      prefix TEXT,
      uploaded_at INTEGER,
      
      PRIMARY KEY(id ASC) 
  ) STRICT
`)
    db.exec(`
  CREATE TABLE IF NOT EXISTS modules(
      id INTEGER,
      module_id TEXT,
      module_identifier TEXT,
      raw BLOB NOT NULL,
      file_id INTEGER NOT NULL,

      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id),
      UNIQUE(module_id, module_identifier, file_id)
  ) STRICT
`)
    db.exec(`
  CREATE TABLE IF NOT EXISTS chunks(
      id INTEGER,
      chunk_id TEXT,
      chunk_name TEXT,
      raw BLOB NOT NULL,
      file_id INTEGER NOT NULL,

      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id),
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