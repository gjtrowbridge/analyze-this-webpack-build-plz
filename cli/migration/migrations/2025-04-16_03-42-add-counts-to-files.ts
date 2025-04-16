import { Migration } from './types'
import type { Database } from 'better-sqlite3'

/**
 * Denormalize the counts of each so I can show % status when loading...
 */
export const addCountsToFileMigration: Migration = {
  up: (db: Database) => {
    db.exec(`
  ALTER TABLE files ADD modules_count INTEGER;
  ALTER TABLE files ADD chunks_count INTEGER;
  ALTER TABLE files ADD named_chunk_groups_count INTEGER;
  ALTER TABLE files ADD assets_count INTEGER;
`)
  },
  down: (db: Database) => {
    db.exec(`
        ALTER TABLE files REMOVE assets_count INTEGER;
        ALTER TABLE files REMOVE named_chunk_groups_count INTEGER;
        ALTER TABLE files REMOVE chunks_count INTEGER;
        ALTER TABLE files REMOVE modules_count INTEGER;
    `)
  }
}