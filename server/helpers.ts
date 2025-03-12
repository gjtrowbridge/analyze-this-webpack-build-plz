import { promises } from "fs"
import { createParseStream } from 'big-json'
import { StatsCompilation } from "webpack"
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'

type DateTimeFormatOptionType = Parameters<Intl.DateTimeFormatConstructor>[1]

const uploadedFilesFolder = './server/stats_files'

export function getStoredFileName(originalFileName: string, prefix?: string) {
  const now = new Date()
  const options: Array<DateTimeFormatOptionType> = [
    {year: 'numeric'},
    {month: '2-digit'},
    {day: '2-digit'},
    {hour: '2-digit', hour12: false},
    {minute: '2-digit'},
    {second: '2-digit'},
  ]
  const dateString = options.map((option) => {
    const formatter = new Intl.DateTimeFormat('en', option)
    return formatter.format(now).padStart(2, '0')
  }).join("-")
  if (prefix) {
    return `${dateString}-${prefix}-${originalFileName}`
  }
  return `${dateString}-${originalFileName}`
}

const maxCacheLength = 2
let mostRecentFilesCache: Array<{
  filePath: string,
  stats: StatsCompilation,
}> = []

export async function loadStatsObjectFromFile(fileName: string): Promise<StatsCompilation> {
  const filePath = `${uploadedFilesFolder}/${fileName}`

  const fileFromCache = mostRecentFilesCache.find((c) => {
    return c.filePath === filePath
  })
  if (fileFromCache) {
    return fileFromCache.stats
  }

  const fh = await promises.open(filePath, 'r')
  const stats: StatsCompilation = new Promise((resolve) => {
    const readStream = fh.createReadStream()
    const parseStream = createParseStream()
    parseStream.on('data', (obj) => {
      fh.close()
      resolve(obj)
    })
    parseStream.on("error", (e) => {
      throw e
    })
    readStream.pipe(parseStream)
  })
  while (mostRecentFilesCache.length >= maxCacheLength) {
    mostRecentFilesCache.shift()
  }
  mostRecentFilesCache.push({
    filePath,
    stats,
  })
  return stats
}

export async function isStatsFilePathValid(fileName: string): Promise<boolean> {
  const fullFilePath = `${uploadedFilesFolder}/${fileName}`
  if (!fullFilePath.endsWith(".json")) {
    return false
  }

  const s = await promises.stat(fullFilePath)
  if (!s.isFile()) {
    return false
  }
  return true
}

export async function writeStatsObjectToFile(args: { readStream: Readable, fileName: string }) {
  const { fileName, readStream } = args
  const a = createWriteStream(`${uploadedFilesFolder}/${fileName}`)
  readStream.pipe(a)
  readStream.on("end", () => {
    return
  })
  readStream.on("error", (e) => {
    throw e
  })
}

export async function getAllStatsFilenames() {
  // Read stats directory
  const r = await promises.readdir(uploadedFilesFolder, { withFileTypes: true })
  // Return list of all files
  return r.filter((entry) => {
    return entry.isFile() && entry.name.endsWith(".json")
  }).map((entry) => {
    return entry.name
  }).sort((a, b) => {
    // Sort so most recent is first
    return b.localeCompare(a)
  })
}
