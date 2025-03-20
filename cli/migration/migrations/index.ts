import { Migration } from '../../../server/db/types'
import { createBasicTablesMigration } from './create-basic-tables-2025-03-20_09-25'

/**
 * Manually add your migrations here when you make 'em
 */
export const migrations: Array<Migration> = [
  createBasicTablesMigration,
]
