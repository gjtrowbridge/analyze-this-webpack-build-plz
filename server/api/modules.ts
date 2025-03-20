import { Router } from 'express'
import { getAllStatsFilenames, isStatsFilePathValid, loadStatsObjectFromFile } from '../helpers/files'

export const modulesRouter = Router()

/**
 * Get modules info for a given file
 */
modulesRouter.get('/:fileName', async (req, res) => {
  let { fileName } = req.params
  if (fileName === "latest") {
    const fileNames = await getAllStatsFilenames()
    fileName = fileNames[0]
  }
  const isValid = await isStatsFilePathValid(fileName)
  if (!isValid) {
    res.status(400).json({ error: `FileName: "${fileName}" is not valid`})
  }

  // TODO(Greg): Maybe add more validation in future...
  const stats = await loadStatsObjectFromFile(fileName)
  const { offset, limit } = req.query
  const o = Number(offset)
  const l = Number(limit)
  const modules = stats.modules?.slice(o, l + o) || []

  // Return the modules
  res.json({
    modules,
  })
})
