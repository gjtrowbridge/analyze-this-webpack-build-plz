import { Router } from 'express'
import busboy from 'busboy'
import { alternateFileNameRegex, getUniqueChunkKey, getUniqueModuleKey } from '../../shared/helpers'
import { createParseStream } from 'big-json'
import { StatsCompilation } from 'webpack'
import { insertFileToDatabase, updateFileInDatabase } from '../db/queries/files'
import { saveModulesToDatabase } from '../db/queries/modules'
import { saveChunksToDatabase } from '../db/queries/chunks'
import {
  DatabaseAssetRow,
  DatabaseChunkRow,
  DatabaseFileRow,
  DatabaseModuleRow,
  DatabaseNamedChunkGroupRow
} from '../helpers/databaseTypes'
import { saveAssetsToDatabase } from '../db/queries/assets'
import { saveNamedChunkGroupsToDatabase } from '../db/queries/namedChunkGroups'

export const uploadRouter = Router()

/**
 * Save the stats file to the database
 */
function processStatsFile(args: {
  stats: StatsCompilation,
  customName: string,
  originalName: string,
}) {
  const {
    stats,
    customName,
    originalName,
  } = args

  const fileRow: Omit<DatabaseFileRow, "id"> = {
    original_name: originalName,
    user_provided_name: customName,
    uploaded_at: Date.now(),
    done_processing: 0,
    modules_count: stats.modules?.length ?? 0,
    chunks_count: stats.chunks?.length ?? 0,
    assets_count: stats.assets?.length ?? 0,
    named_chunk_groups_count: stats.namedChunkGroups !== undefined ? Object.keys(stats.namedChunkGroups).length : 0,
  }

  /**
   * Insert file without marking it as done
   */
  const file_id = insertFileToDatabase(fileRow)
  /**
   * Insert modules, if they exist in the stats object
   */
  if (stats.modules) {
    const moduleRows: Array<Omit<DatabaseModuleRow, 'id'>> = stats.modules.map((m) => {
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
  /**
   * Insert chunks, if they exist in the stats object
   */
  if (stats.chunks) {
    const chunkRows: Array<Omit<DatabaseChunkRow, 'id'>> = stats.chunks.map((c) => {
      return {
        chunk_id: getUniqueChunkKey(c),
        chunk_name: c.names.join(","),
        raw_json: JSON.stringify(c),
        file_id,
      }
    })
    saveChunksToDatabase(chunkRows)
  }
  /**
   * Insert assets, if they exist in the stats object
   */
  if (stats.assets) {
    const assetRows: Array<Omit<DatabaseAssetRow, 'id'>> = stats.assets.map((a) => {
      return {
        id: a.id,
        name: a.name,
        raw_json: JSON.stringify(a),
        file_id,
      }
    })
    saveAssetsToDatabase(assetRows)
  }
  /**
   * Insert named chunk groups, if they exist in the stats object
   */
  if (stats.namedChunkGroups) {
    const keys = Object.keys(stats.namedChunkGroups)
    const namedChunkGroups: Array<Omit<DatabaseNamedChunkGroupRow, 'id'>> = keys.map((key) => {
      const ncg = stats.namedChunkGroups[key]
      return {
        id: ncg.id,
        name: ncg.name,
        raw_json: JSON.stringify(ncg),
        file_id,
      }
    })
    saveNamedChunkGroupsToDatabase(namedChunkGroups)
  }

  /**
   * When every part of the file has been processed, mark the file as done
   */
  updateFileInDatabase({
    ...fileRow,
    id: file_id,
    done_processing: 1,
  })

  return file_id
}

/**
 * Accepts uploaded stats.json files
 */
uploadRouter.post("/", (req, res) => {
  const bb = busboy({ headers: req.headers })
  let customName: string = "<no custom name provided>"
  bb.on('field', (name, val, info) => {
    if (name === "alternateName" && alternateFileNameRegex.test(val)) {
      customName = val
    }
  })
  bb.on('file', async (name, file, info) => {
    const { filename } = info
    // const fileNameToSave = getStoredFileName(filename, customName)
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
      const fileId = processStatsFile({
        stats,
        originalName: filename,
        customName,
      })
      res.status(201).json({ fileId })
    }
  })
  bb.on('close', () => {})
  bb.on('error', (error: unknown) => {
    console.log('ERROR:', error)
    res.status(500).json({ error: "Something went wrong" })
  })
  req.pipe(bb)
})

