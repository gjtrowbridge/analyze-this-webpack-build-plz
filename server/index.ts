import * as express from 'express'
import * as busboy from 'busboy'
import {
    getAllStatsFilenames,
    getStoredFileName,
    isStatsFilePathValid,
    loadStatsObjectFromFile,
    writeStatsObjectToFile
} from "./helpers"
import { alternateFileNameRegex } from '../shared/helpers'

const app = express()
const port = 8080

const uploadedFilesFolder = './server/stats_files'

/**
 * Lists all currently-uploaded files
 */
app.get('/api/files', async (req, res) => {
    const fileNames = await getAllStatsFilenames()
    if (fileNames.length > 0) {
        fileNames.unshift("latest")
    }
    res.status(200).json({
        files: fileNames
    })
})

/**
 * Accepts uploaded files
 */
app.post('/api/stats/upload', (req, res) => {
    const bb = busboy({ headers: req.headers })
    let fileNamePrefix: string | undefined = undefined
    bb.on('field', (name, val, info) => {
        if (name === "alternateName" && alternateFileNameRegex.test(val)) {
            fileNamePrefix = val
        }
    })
    bb.on('file', (name, file, info) => {
        const { filename } = info
        // TODO: Fix the race condition here, for now it's fine
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

app.get('/api/raw_file/:fileName', async (req, res) => {
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

/**
 * Get modules info for a given file
 */
app.get('/api/modules/:fileName', async (req, res) => {
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

/**
 * Get chunks info for a given file
 */
app.get('/api/chunks/:fileName', async (req, res) => {
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
    const chunks = stats.chunks?.slice(o, l + o) || []

    // Return the chunks
    res.json({
        chunks,
    })
})

app.use('/', express.static('dist/client'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
