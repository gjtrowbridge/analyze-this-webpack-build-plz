import { useHookstate } from '@hookstate/core'
import {
  file1ChunksGlobalState,
  file1ModulesGlobalState, file1ProcessedGlobalState,
  file2ChunksGlobalState,
  file2ModulesGlobalState, file2ProcessedGlobalState
} from '../globalState'
import { useEffect } from 'react'
import { processModulesAndChunks } from '../helpers/processModulesAndChunks'


export function useProcessState() {
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)
  const modulesFile1 = useHookstate(file1ModulesGlobalState)
  const modulesFile2 = useHookstate(file2ModulesGlobalState)
  const chunksFile1 = useHookstate(file1ChunksGlobalState)
  const chunksFile2 = useHookstate(file2ChunksGlobalState)

  const file1IsReadyToProcess = modulesFile1.ready.get() && chunksFile1.ready.get() && file1ProcessedState.ornull === null

  useEffect(() => {
    if (!file1IsReadyToProcess) {
      return
    }
    const modules = modulesFile1.modules
    const chunks = chunksFile1.chunks
    console.log('xcxc processing modules and chunks file 1...')
    const processedState = processModulesAndChunks({
      moduleRows: modules.get(),
      chunkRows: chunks.get(),
    })
    file1ProcessedState.set(processedState)

  }, [modulesFile1.ready, chunksFile1.ready, file1ProcessedState.get()])

  useEffect(() => {
    if (!modulesFile2.ready || !chunksFile2.ready || file2ProcessedState !== null) {
      return
    }
    const modules = modulesFile2.modules
    const chunks = chunksFile2.chunks
    console.log('xcxc processing modules and chunks file 2...')
    const processedState = processModulesAndChunks({
      moduleRows: modules.get(),
      chunkRows: chunks.get(),
    })
    file2ProcessedGlobalState.set(processedState)

  }, [modulesFile2.ready, chunksFile2.ready, file2ProcessedState])

}