import { Router } from 'express'
import busboy from 'busboy'
import { alternateFileNameRegex, getUniqueModuleKey } from '../../shared/helpers'
import { getStoredFileName, writeStatsObjectToFile } from '../helpers/files'
import { createParseStream } from 'big-json'
import { StatsCompilation } from 'webpack'
import { saveFileToDatabase } from '../db/queries/files'
import { ModuleRow } from '../db/types'
import { saveModulesToDatabase } from '../db/queries/modules'

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
  bb.on('file', async (name, file, info) => {
    const { filename } = info
    const fileNameToSave = getStoredFileName(filename, fileNamePrefix)
    if (name === 'file') {
      const p: Promise<StatsCompilation> = new Promise((resolve) => {
        const readStream = file
        const parseStream = createParseStream()
        parseStream.on('data', (obj) => {
          resolve(obj)
        })
        parseStream.on("error", (e) => {
          throw e
        })
        readStream.pipe(parseStream)
      })
      const stats = await p
      const file_id = saveFileToDatabase({
        original_name: filename,
        user_provided_name: fileNamePrefix ?? "",
        uploaded_at: Date.now(),
        done_processing: 0,
      })
      if (stats.modules) {
        const moduleRows: Array<ModuleRow> = stats.modules.map((m) => {
          return {
            unique_key: getUniqueModuleKey(m),
            module_id: String(m.id),
            module_identifier: String(m.identifier),
            raw_json: JSON.stringify(m),
            file_id,
          }
        })
        saveModulesToDatabase(moduleRows)
      }
      res.status(201).json({ fileId: file_id })
    }
  })
  bb.on('close', () => {})
  bb.on('error', (error: unknown) => {
    console.log('ERROR:', error)
    res.status(500).json({ error: "Something went wrong" })
  })
  req.pipe(bb)
})

