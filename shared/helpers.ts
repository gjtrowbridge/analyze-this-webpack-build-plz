import { StatsChunk, StatsModule } from 'webpack'

export const alternateFileNameRegex = /^[a-zA-Z\-_0-9]+$/

export function getUniqueModuleKey(m: StatsModule) {
  return [String(m.id), String(m.identifier), String(m.chunks)].join("~~~")
}
export function getUniqueChunkKey(c: StatsChunk) {
  return [String(c.id), String(c.names.join(","))].join("~~~")
}

export function unreachable(a: never) {
  throw `Unreachable code was reached: ${a}`
}
