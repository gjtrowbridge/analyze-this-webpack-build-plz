import { hookstate, State } from '@hookstate/core';
import { type ReactChunkState, ReactModuleState } from './types'
import { ChunkRow, FileRow, ModuleRow } from '../shared/types'
import { ProcessedChunkInfo, ProcessedModuleInfo, ProcessedState } from './helpers/processModulesAndChunks'


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

export const filesState = hookstate<FileState>({
  status: 'NOT_LOADED',
})
export const errorsState = hookstate<Array<string>>([])

// Deprecate these 4 as soon as I can...
export const modulesStateFile1: State<ReactModuleState | null> = hookstate<ReactModuleState | null>(null)
export const modulesStateFile2: State<ReactModuleState | null> = hookstate<ReactModuleState | null>(null)
export const chunksStateFile1: State<ReactChunkState | null> = hookstate<ReactChunkState | null>(null)
export const chunksStateFile2: State<ReactChunkState | null> = hookstate<ReactChunkState | null>(null)

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

export const file1ProcessedGlobalState: State<ProcessedState | null> = hookstate<ProcessedState | null>(null)
export const file2ProcessedGlobalState: State<ProcessedState | null> = hookstate<ProcessedState | null>(null)
