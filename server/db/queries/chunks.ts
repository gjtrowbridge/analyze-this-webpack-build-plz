import { ChunkRow } from '../../../shared/types'
import { db } from '../database'


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

export function saveChunksToDatabase(chunkRows: Array<ChunkRow>) {
  const insert = db.prepare(insertStatement)
  const transaction = db.transaction((crs: Array<ChunkRow>) => {
    for (let cr of crs) {
      insert.run(cr)
    }
  })
  transaction(chunkRows)
}
