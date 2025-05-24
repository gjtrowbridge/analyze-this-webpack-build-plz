import { Migration } from './types'
import type { Database } from 'better-sqlite3'

/**
 * Denormalize the counts of each so I can show % status when loading...
 */
export const addCountsToFileMigration: Migration = {
  name: '2025-04-16_03-42-add-counts-to-files',
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
        ALTER TABLE files DROP assets_count;
        ALTER TABLE files DROP named_chunk_groups_count;
        ALTER TABLE files DROP chunks_count;
        ALTER TABLE files DROP modules_count;
    `)
  }
}