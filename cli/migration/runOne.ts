import { db } from '../../server/db/database'
import { createBasicTablesMigration } from './migrations/create-basic-tables-2025-03-20_09-25'

/**
 * Just manually update this, I don't want to write a fancy thingy for this
 */
createBasicTablesMigration.up(db)
createBasicTablesMigration.down(db)
