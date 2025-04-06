import { useCallback } from 'react'
import { useHookstate } from '@hookstate/core'
import {
  file1ChunksGlobalState,
  file1ModulesGlobalState,
  file1ProcessedGlobalState, file2ChunksGlobalState,
  file2ModulesGlobalState, file2ProcessedGlobalState
} from '../globalState'

export function useResetState() {
  const file1ModuleState = useHookstate(file1ModulesGlobalState)
  const file1ChunkState = useHookstate(file1ChunksGlobalState)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ModuleState = useHookstate(file2ModulesGlobalState)
  const file2ChunkState = useHookstate(file2ChunksGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)

  const resetFile1State = useCallback(() => {
    console.log('xcxc resetting file state 1')
    file1ModuleState.set({
      ready: false,
      modules: [],
    })
    file1ChunkState.set({
      ready: false,
      chunks: [],
    })
    file1ProcessedState.set(null)
  }, [file1ModuleState, file1ChunkState, file1ProcessedState]);
  const resetFile2State = useCallback(() => {
    console.log('xcxc resetting file state 2')
    file2ModuleState.set({
      ready: false,
      modules: [],
    })
    file2ChunkState.set({
      ready: false,
      chunks: [],
    })
    file2ProcessedState.set(null)
  }, [file2ModuleState, file2ChunkState, file2ProcessedState])

  return {
    resetFile1State,
    resetFile2State,
  }
}
