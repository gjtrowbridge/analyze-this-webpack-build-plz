import { ChunkRow } from '../../../shared/types'
import { db } from '../database'
import { Statement } from 'better-sqlite3'


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

export function saveChunksToDatabase(chunkRows: Array<ChunkRow>) {
  const insert = db.prepare(insertStatement)
  const transaction = db.transaction((crs: Array<ChunkRow>) => {
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
}): Array<ChunkRow & { id: number }> {
  const getMany: Statement<unknown[], ChunkRow & { id: number }> = db.prepare(getManyStatement)
  return getMany.all(args)
}