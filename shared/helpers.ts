import { StatsModule } from 'webpack'

export const alternateFileNameRegex = /^[a-zA-Z\-_0-9]+$/

export function getUniqueModuleKey(m: StatsModule) {
  return [String(m.id), String(m.identifier), String(m.chunks)].join("~~~")
}
