import { Migration } from './types'
import { createBasicTablesMigration } from './create-basic-tables-2025-03-20_09-25'
import {
  createAssetsAndChunkGroupsTablesMigration
} from './create-assets-and-named-chunk-groups-tables-2025-04-16_02-38'

/**
 * Manually add your migrations here when you make 'em
 */
export const migrations: Array<Migration> = [
  createBasicTablesMigration,
  createAssetsAndChunkGroupsTablesMigration,
]
