import { Migration } from './types'

import { addCountsToFileMigration } from './2025-04-16_03-42-add-counts-to-files'
import { createBasicTablesMigration } from './2025-03-20_09-25-create-basic-tables'
import {
  createAssetsAndChunkGroupsTablesMigration
} from './2025-04-16_02-38-create-assets-and-named-chunk-groups-tables'

/**
 * Manually add your migrations here when you make 'em
 */
export const migrations: Array<Migration> = [
  createBasicTablesMigration,
  createAssetsAndChunkGroupsTablesMigration,
  addCountsToFileMigration,
]
