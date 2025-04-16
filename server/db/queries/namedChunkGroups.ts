import { NamedChunkGroupRow } from '../../../shared/types'
import { Statement } from 'better-sqlite3'
import {
  convertToSharedNamedChunkGroupType,
  DatabaseNamedChunkGroupRow,
} from '../../helpers/databaseTypes'
import { db } from '../database'

const insertStatement = `
  INSERT INTO named_chunk_groups (
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
  SELECT * FROM named_chunk_groups
           WHERE
               id > @minIdNonInclusive AND
               file_id = @fileId
           ORDER BY id
           LIMIT @limit
`

export function saveNamedChunkGroupsToDatabase(dbRows: Array<Omit<DatabaseNamedChunkGroupRow, 'id'>>) {
  const insert = db.prepare(insertStatement)
  const transaction = db.transaction((rows: Array<Omit<DatabaseNamedChunkGroupRow, 'id'>>) => {
    for (let row of rows) {
      insert.run(row)
    }
  })
  transaction(dbRows)
}

export function getNamedChunkGroupsFromDatabase(args: {
  fileId: number,
  limit: number,
  minIdNonInclusive: number,
}): Array<NamedChunkGroupRow> {
  const getMany: Statement<unknown[], DatabaseNamedChunkGroupRow> = db.prepare(getManyStatement)
  const dbRows = getMany.all(args)
  return dbRows.map(convertToSharedNamedChunkGroupType)
}
