import { Router } from 'express'
import { getAllStatsFilenames, isStatsFilePathValid, loadStatsObjectFromFile } from '../helpers'

export const filesRouter = Router()

/**
 * Lists all currently-uploaded files
 */
filesRouter.get('/', async (req, res) => {
  const fileNames = await getAllStatsFilenames()
  if (fileNames.length > 0) {
    fileNames.unshift("latest")
  }
  res.status(200).json({
    files: fileNames
  })
})

/**
 * Get the raw file data (may deprecate this soon)
 */
filesRouter.get('/:fileName', async (req, res) => {
  let { fileName } = req.params
  if (fileName === "latest") {
    const fileNames = await getAllStatsFilenames()
    fileName = fileNames[0]
  }
  const isValid = await isStatsFilePathValid(fileName)
  if (!isValid) {
    res.status(400).json({ error: `FileName: "${fileName}" is not valid`})
  }
  const stats = await loadStatsObjectFromFile(fileName)
  res.json(stats)
})
