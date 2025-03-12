import type { StatsChunk, StatsModule } from 'webpack'

export type ReactModuleState = {
  ready: true
  statusMessage: string
  modules: Array<StatsModule>
} | { ready: false, statusMessage?: string }

export type ReactChunkState = {
  ready: true
  statusMessage: string
  chunks: Array<StatsChunk>
} | { ready: false, statusMessage?: string }