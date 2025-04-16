import { Router } from 'express'
import { convertToInteger } from '../helpers/misc'
import { getAssetsFromDatabase } from '../db/queries/assets'

export const assetsRouter = Router()

/**
 * Get assets info for a given file
 */
assetsRouter.get('/:fileId', async (req, res) => {

  const fileId = convertToInteger(req.params.fileId)
  const limit = convertToInteger(req.query.limit) ?? 10
  const minIdNonInclusive = convertToInteger(req.query.minIdNonInclusive) ?? -1

  const assetRows = getAssetsFromDatabase({
    limit,
    minIdNonInclusive,
    fileId
  })

  // Return the modules
  res.json({
    assetRows,
    lastId: assetRows.length > 0 ? assetRows[assetRows.length - 1].databaseId : null
  })
})
