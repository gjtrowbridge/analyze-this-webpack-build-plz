import type { Database } from 'better-sqlite3'

export interface Migration {
  up: (db: Database) => void
  down: (db: Database) => void
}
