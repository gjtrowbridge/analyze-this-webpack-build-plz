import { hookstate, State } from '@hookstate/core';
import { ChunkRow, FileRow, ModuleRow } from '../shared/types'
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
export const filesState = hookstate<FileState>({
  status: 'NOT_LOADED',
})
export const errorsState = hookstate<Array<string>>([])

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
