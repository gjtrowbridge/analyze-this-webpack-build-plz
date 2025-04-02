import { Router } from 'express'
import { convertToInteger } from '../helpers/misc'
import { getChunksFromDatabase } from '../db/queries/chunks'

export const chunksRouter = Router()

/**
 * Get chunks info for a given file
 */
chunksRouter.get('/:fileId', async (req, res) => {
  const fileId = convertToInteger(req.params.fileId)
  const limit = convertToInteger(req.query.limit) ?? 10
  const minIdNonInclusive = convertToInteger(req.query.minIdNonInclusive) ?? -1

  const chunkRows = getChunksFromDatabase({
    limit,
    minIdNonInclusive,
    fileId
  })

  // Return the modules
  res.json({
    chunkRows,
    lastId: chunkRows.length > 0 ? chunkRows[chunkRows.length - 1].databaseId : null
  })
})
