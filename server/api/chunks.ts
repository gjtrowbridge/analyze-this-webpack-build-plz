import { Router } from 'express'
import { getAllStatsFilenames, isStatsFilePathValid, loadStatsObjectFromFile } from '../helpers/files'

export const chunksRouter = Router()

/**
 * Get chunks info for a given file
 */
chunksRouter.get('/:fileName', async (req, res) => {
  let { fileName } = req.params
  if (fileName === "latest") {
    const fileNames = await getAllStatsFilenames()
    fileName = fileNames[0]
  }
  const [isValid] = await Promise.all([isStatsFilePathValid(fileName)])
  if (!isValid) {
    res.status(400).json({ error: `FileName: "${fileName}" is not valid`})
  }

  const stats = await loadStatsObjectFromFile(fileName)
  const { offset, limit } = req.query
  const o = Number(offset)
  const l = Number(limit)
  const chunks = stats.chunks?.slice(o, l + o) || []

  // Return the chunks
  res.json({
    chunks,
  })
})
