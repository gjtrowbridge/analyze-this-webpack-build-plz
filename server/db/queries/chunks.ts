import { ChunkRow } from '../../../shared/types'
import { db } from '../database'
import { Statement } from 'better-sqlite3'
import { convertToSharedChunkType, DatabaseChunkRow } from '../../helpers/databaseTypes'


const insertStatement = `
  INSERT INTO chunks (
                      chunk_id,
                      chunk_name,
                      raw_json,
                      file_id
  ) VALUES (
            @chunk_id,
            @chunk_name,
            @raw_json,
            @file_id
  )
`

const getManyStatement = `
  SELECT * FROM chunks
           WHERE
               id > @minIdNonInclusive AND
               file_id = @fileId
           ORDER BY id
           LIMIT @limit
`

export function saveChunksToDatabase(chunkRows: Array<Omit<DatabaseChunkRow, "id">>) {
  const insert = db.prepare(insertStatement)
  const transaction = db.transaction((crs: Array<Omit<DatabaseChunkRow, "id">>) => {
    for (let cr of crs) {
      insert.run(cr)
    }
  })
  transaction(chunkRows)
}

export function getChunksFromDatabase(args: {
  fileId: number,
  limit: number,
  minIdNonInclusive: number,
}): Array<ChunkRow> {
  const getMany: Statement<unknown[], DatabaseChunkRow> = db.prepare(getManyStatement)
  return getMany.all(args).map(convertToSharedChunkType)
}