import { AssetRow } from '../../../shared/types'
import { Statement } from 'better-sqlite3'
import {
  convertToSharedAssetType,
  DatabaseAssetRow, DatabaseModuleRow,
} from '../../helpers/databaseTypes'
import { db } from '../database'

const insertStatement = `
  INSERT INTO assets (
                     id,
                     name,
                     raw_json,
                     file_id
  ) VALUES (
                     @id,
                     @name,
                     @raw_json,
                     @file_id
  )
`

const getManyStatement = `
  SELECT * FROM assets
           WHERE
               id > @minIdNonInclusive AND
               file_id = @fileId
           ORDER BY id
           LIMIT @limit
`

export function saveAssetsToDatabase(dbRows: Array<Omit<DatabaseAssetRow, 'id'>>) {
  const insert = db.prepare(insertStatement)
  const transaction = db.transaction((rows: Array<Omit<DatabaseAssetRow, 'id'>>) => {
    for (let row of rows) {
      insert.run(row)
    }
  })
  transaction(dbRows)
}

export function getAssetsFromDatabase(args: {
  fileId: number,
  limit: number,
  minIdNonInclusive: number,
}): Array<AssetRow> {
  const getMany: Statement<unknown[], DatabaseAssetRow> = db.prepare(getManyStatement)
  const dbRows = getMany.all(args)
  return dbRows.map(convertToSharedAssetType)
}
