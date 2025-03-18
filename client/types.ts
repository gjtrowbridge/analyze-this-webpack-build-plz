import type { StatsChunk, StatsModule } from 'webpack'
import { ModuleIdentifier } from './helpers/modules'
import { ChunkIdentifier } from './helpers/chunks'

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

export type ModulesById = Map<ModuleIdentifier, StatsModule>
export type ChunksById = Map<ChunkIdentifier, StatsChunk>