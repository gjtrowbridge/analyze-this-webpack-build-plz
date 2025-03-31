import type { StatsChunk, StatsModule } from 'webpack'
import { ChunkIdentifier } from './helpers/chunks'

type ModuleIdentifier = string

export type ModulesById = Map<ModuleIdentifier, StatsModule>
export type ChunksById = Map<ChunkIdentifier, StatsChunk>