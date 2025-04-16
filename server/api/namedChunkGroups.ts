import { Router } from 'express'
import { convertToInteger } from '../helpers/misc'
import { getNamedChunkGroupsFromDatabase } from '../db/queries/namedChunkGroups'

export const namedChunkGroupsRouter = Router()

/**
 * Get namedChunkGroups info for a given file
 */
namedChunkGroupsRouter.get('/:fileId', async (req, res) => {

  const fileId = convertToInteger(req.params.fileId)
  const limit = convertToInteger(req.query.limit) ?? 10
  const minIdNonInclusive = convertToInteger(req.query.minIdNonInclusive) ?? -1

  const namedChunkGroupRows = getNamedChunkGroupsFromDatabase({
    limit,
    minIdNonInclusive,
    fileId
  })

  // Return the modules
  res.json({
    namedChunkGroupRows,
    lastId: namedChunkGroupRows.length > 0 ? namedChunkGroupRows[namedChunkGroupRows.length - 1].databaseId : null
  })
})
