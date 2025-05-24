import { Migration } from './types'
import type { Database } from 'better-sqlite3'

export const createAssetsAndChunkGroupsTablesMigration: Migration = {
  name: '2025-04-16_02-38-create-assets-and-named-chunk-groups-tables',
  up: (db: Database) => {
    db.exec(`
  CREATE TABLE IF NOT EXISTS assets(
      id INTEGER,
      
      name TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      file_id INTEGER NOT NULL,
      
      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(name, file_id)
  ) STRICT
`)
    db.exec(`
  CREATE TABLE IF NOT EXISTS named_chunk_groups(
      id INTEGER,
      
      name TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      file_id INTEGER NOT NULL,
      
      PRIMARY KEY(id ASC),
      FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(name, file_id)
  ) STRICT
`)
  },
  down: (db: Database) => {
    db.exec(`DROP TABLE IF EXISTS named_chunk_groups`);
    db.exec(`DROP TABLE IF EXISTS assets`);
  }
}