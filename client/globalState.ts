import { hookstate, State } from '@hookstate/core';
import { AssetRow, ChunkRow, FileRow, ModuleRow } from '../shared/types'
import { ProcessedState } from './helpers/processModulesAndChunks'


export interface LoadedFileData {
  existingFiles: Array<FileRow>
  selectedFileId1: number,
  selectedFileId2?: number,
}
export type FileState = {
  status: 'NOT_LOADED' | 'LOADING' | 'ERROR'
} | ({
  status: 'LOADED',
} & LoadedFileData)

export const fileRefreshCountGlobalState = hookstate(0)
export const filesGlobalState = hookstate<FileState>({
  status: 'NOT_LOADED',
})
export const errorsGlobalState = hookstate<Array<string>>([])

export const file1ModulesGlobalState = hookstate<{ ready: boolean, modules: Array<ModuleRow> }>({
  ready: false,
  modules: [],
})
export const file2ModulesGlobalState = hookstate<{ ready: boolean, modules: Array<ModuleRow> }>({
  ready: false,
  modules: [],
})
export const file1ChunksGlobalState = hookstate<{ ready: boolean, chunks: Array<ChunkRow> }>({
  ready: false,
  chunks: [],
})
export const file2ChunksGlobalState = hookstate<{ ready: boolean, chunks: Array<ChunkRow> }>({
  ready: false,
  chunks: [],
})

export const defaultProcessedState: ProcessedState = {
  status: 'NOT_LOADED',
  progress: {
    modules: 0,
    chunks: 0,
  },
  modulesByDatabaseId: new Map(),
  modulesByWebpackIdentifier: new Map(),
  chunksByDatabaseId: new Map(),
  chunksByWebpackId: new Map(),
  moduleInclusionReasons: new Set(),
  namedChunkGroupsByDatabaseId: new Map(),
  assetsByDatabaseId: new Map(),
}
export const file1ProcessedGlobalState: State<ProcessedState> = hookstate<ProcessedState>({ ...defaultProcessedState })
export const file2ProcessedGlobalState: State<ProcessedState> = hookstate<ProcessedState>({ ...defaultProcessedState })
