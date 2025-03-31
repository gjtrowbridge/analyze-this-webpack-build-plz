import { ProcessedChunkInfo } from './processModulesAndChunks'
import { ImmutableObject } from '@hookstate/core'

export type ChunkIdentifier = string | number

export function getHumanReadableChunkName(chunk: ImmutableObject<ProcessedChunkInfo> | undefined) {
  if (!chunk) {
    return "N/A (Chunk undefined)"
  }
  const name = chunk.rawFromWebpack.names.join(" | ")
  if (name === "") {
    return `Unnamed Chunk (webpack id: ${chunk.rawFromWebpack.id})`
  }
  return name
}

export function getSanitizedChunkId(chunkId: string | number | null) {
  if (chunkId === null) {
    return '~~null~~'
  }
  return String(chunkId)
}
