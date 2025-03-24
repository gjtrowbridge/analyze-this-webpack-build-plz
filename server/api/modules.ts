import { Router } from 'express'
import { getModulesFromDatabase } from '../db/queries/modules'
import { convertToInteger } from '../helpers/misc'
import { type StatsModule } from 'webpack'
import { ModuleRow } from '../../shared/types'

export const modulesRouter = Router()

/**
 * Get modules info for a given file
 */
modulesRouter.get('/:fileId', async (req, res) => {

  const fileId = convertToInteger(req.params.fileId)
  const limit = convertToInteger(req.query.limit) ?? 10
  const minIdNonInclusive = convertToInteger(req.query.minIdNonInclusive) ?? -1

  const moduleRows = getModulesFromDatabase({
    limit,
    minIdNonInclusive,
    fileId
  })

  // Return the modules
  res.json({
    moduleRows,
    lastId: moduleRows.length > 0 ? moduleRows[moduleRows.length - 1].id : null
  })
})
