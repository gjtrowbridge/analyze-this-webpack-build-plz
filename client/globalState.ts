import { hookstate, State } from '@hookstate/core';
import { type ReactChunkState, ReactModuleState } from './types'
import { FileRow } from '../shared/types'

export type FileState = {
  status: 'NOT_LOADED' | 'LOADING' | 'ERROR'
} | {
  status: 'LOADED'
  existingFiles?: Array<FileRow>
  selectedFileId1?: number,
  selectedFileId2?: number,
}

export const defaultModuleState: ReactModuleState = { ready: false }
export const defaultChunkState: ReactChunkState = { ready: false }

export const filesState = hookstate<FileState>({
  status: 'NOT_LOADED',
})
export const errorsState = hookstate<Array<string>>([])
