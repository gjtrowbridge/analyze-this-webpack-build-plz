import { hookstate, State } from '@hookstate/core';
import { type ReactChunkState, ReactModuleState } from './types'
import { FileRow } from '../shared/types'


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

export const modulesStateFile1: State<ReactModuleState | null> = hookstate<ReactModuleState | null>(null)
export const modulesStateFile2: State<ReactModuleState | null> = hookstate<ReactModuleState | null>(null)

export const chunksStateFile1: State<ReactChunkState | null> = hookstate<ReactChunkState | null>(null)
export const chunksStateFile2: State<ReactChunkState | null> = hookstate<ReactChunkState | null>(null)
