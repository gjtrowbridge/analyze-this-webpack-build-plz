import { Router } from 'express'
import * as busboy from 'busboy'
import { alternateFileNameRegex } from '../../shared/helpers'
import { getStoredFileName, writeStatsObjectToFile } from '../helpers/files'

export const uploadRouter = Router()

/**
 * Accepts uploaded stats.json files
 */
uploadRouter.post("/", (req, res) => {
  const bb = busboy({ headers: req.headers })
  let fileNamePrefix: string | undefined = undefined
  bb.on('field', (name, val, info) => {
    if (name === "alternateName" && alternateFileNameRegex.test(val)) {
      fileNamePrefix = val
    }
  })
  bb.on('file', (name, file, info) => {
    const { filename } = info
    const fileNameToSave = getStoredFileName(filename, fileNamePrefix)
    if (name === 'file') {
      writeStatsObjectToFile({
        readStream: file,
        fileName: fileNameToSave,
      }).then(() => {
        res.status(201).json({ message: "successfully saved file", fileName: fileNameToSave })
      }).catch((e) => {
        res.status(500).json({ message: "something went wrong", error: e })
      })
    }
  })
  bb.on('close', () => {})
  bb.on('error', (error: unknown) => {
    console.log('ERROR:', error)
    res.status(500).json({ error: "Something went wrong" })
  })
  req.pipe(bb)
})

