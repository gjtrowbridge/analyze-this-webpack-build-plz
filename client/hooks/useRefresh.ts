import { useCallback, useRef } from 'react'
import { AssetRow, ChunkRow, ModuleRow, NamedChunkGroupRow } from '../../shared/types'
import axios from 'axios'
import { useHookstate } from '@hookstate/core'
import {
  defaultProcessedState,
  errorsGlobalState,
  file1ProcessedGlobalState,
  file2ProcessedGlobalState,
  filesGlobalState
} from '../globalState'
import { processState } from '../helpers/processModulesAndChunks'
import { unreachable } from '../../shared/helpers'
import { getPercentage } from '../helpers/math'

export function useStateRefreshFunctions() {
  const errors = useHookstate(errorsGlobalState)
  const files = useHookstate(filesGlobalState)
  const file1State = useHookstate(file1ProcessedGlobalState)
  const file2State = useHookstate(file2ProcessedGlobalState)
  const runIds = useRef<{
    file1?: number,
    file2?: number,
  }>({})

  const queryModules = useCallback(async (args: {
    file: 'file1' | 'file2'
    fileId?: number
    currentRunId: number
  }) => {
    const { fileId, file, currentRunId } = args
    if (!fileId) {
      return []
    }
    const fileData = files.get()
    if (fileData.status !== 'LOADED') {
      throw 'Trying to refresh an unloaded module...'
    }
    const fileRow = fileData.existingFiles.find((f) => {
      return f.id === fileId
    })

    const limit = 100
    let minIdNonInclusive = -1
    const modules: Array<ModuleRow> = []
    if (file === 'file1') {
      file1State.merge((prev) => {
        return {
          status: 'LOADING',
          progress: {
            ...prev.progress,
            modules: 0,
          }
        }
      })
    } else if (file === 'file2') {
      file2State.merge((prev) => {
        return {
          status: 'LOADING',
          progress: {
            ...prev.progress,
            modules: 0,
          }
        }
      })
    } else {
      unreachable(file)
    }
    while (true) {
      try {
        const res = await axios.get<{
          moduleRows: Array<ModuleRow>
          lastId: number | null
        }>(`/api/modules/${fileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
        if (currentRunId !== runIds.current[file]) {
          console.log(`exiting modules query early for file ${file}, (${currentRunId} !== ${runIds.current[file]})`)
          return null
        }
        const { moduleRows, lastId } = res.data
        moduleRows.forEach((mr) => {
          modules.push(mr)
        })
        const modulePercentage = getPercentage({
          numerator: modules.length,
          denominator: fileRow.modules_count,
        })
        if (file === 'file1') {
          file1State.set((prev) => {
            return {
              ...prev,
              progress: {
                ...prev.progress,
                modules: modulePercentage,
              }
            }
          })
        } else if (file === 'file2') {
          file2State.set((prev) => {
            return {
              ...prev,
              progress: {
                ...prev.progress,
                modules: modulePercentage,
              }
            }
          })
        } else {
          unreachable(file)
        }
        
        // console.log(`QUERYING FOR MODULES: ${progress}`)
        if (lastId === null) {
          break
        }
        minIdNonInclusive = lastId
      } catch(e) {
        errors.merge("[MODULES]: Something went wrong fetching the list of available modules")
        return null
      }
    }
    return modules
  }, [runIds, errors, files, file1State, file2State])
  const queryChunks = useCallback(async (args: {
    file: 'file1' | 'file2'
    fileId: number
    currentRunId: number
  }) => {
    const {
      file,
      fileId,
      currentRunId,
    } = args
    if (!fileId) {
      return []
    }
    const limit = 50
    let minIdNonInclusive = -1
    const chunks: Array<ChunkRow> = []
    while (true) {
      try {
        const res = await axios.get<{
          chunkRows: Array<ChunkRow>
          lastId: number | null
        }>(`/api/chunks/${fileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
        if (currentRunId !== runIds.current[file]) {
          console.log(`exiting chunks query early for file ${file}, (${currentRunId} !== ${runIds.current[file]})`)
          return null
        }
        const { chunkRows, lastId } = res.data
        chunkRows.forEach((cr) => {
          chunks.push(cr)
        })
        if (lastId === null) {
          break
        }
        minIdNonInclusive = lastId
      } catch(e) {
        errors.merge(["[CHUNKS]: Something went wrong fetching the list of available chunks"])
        return
      }
    }
    return chunks
  }, [runIds, errors])
  const queryNamedChunkGroups = useCallback(async (args: {
    file: 'file1' | 'file2'
    fileId: number
    currentRunId: number
  }) =>  {
    const {
      file,
      fileId,
      currentRunId,
    } = args
    if (!fileId) {
      return []
    }
    const limit = 50
    let minIdNonInclusive = -1
    const namedChunkGroups: Array<NamedChunkGroupRow> = []
    while (true) {
      try {
        const res = await axios.get<{
          namedChunkGroupRows: Array<NamedChunkGroupRow>
          lastId: number | null
        }>(`/api/named-chunk-groups/${fileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
        if (currentRunId !== runIds.current[file]) {
          console.log(`exiting named chunk groups query early for file ${file}, (${currentRunId} !== ${runIds.current[file]})`)
          return null
        }
        const { namedChunkGroupRows, lastId } = res.data
        namedChunkGroupRows.forEach((ncgr) => {
          namedChunkGroups.push(ncgr)
        })
        if (lastId === null) {
          break
        }
        minIdNonInclusive = lastId
      } catch(e) {
        errors.merge(["[CHUNKS]: Something went wrong fetching the list of available named chunk groups"])
        return
      }
    }
    return namedChunkGroups
  }, [runIds])

  const queryAssets = useCallback(async (args: {
    file: 'file1' | 'file2'
    fileId: number
    currentRunId: number
  }) =>  {
    const {
      file,
      fileId,
      currentRunId,
    } = args
    if (!fileId) {
      return []
    }
    const limit = 50
    let minIdNonInclusive = -1
    const assets: Array<AssetRow> = []
    while (true) {
      try {
        const res = await axios.get<{
          assetRows: Array<AssetRow>
          lastId: number | null
        }>(`/api/assets/${fileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
        if (currentRunId !== runIds.current[file]) {
          console.log(`exiting assets query early for file ${file}, (${currentRunId} !== ${runIds.current[file]})`)
          return null
        }
        const { assetRows, lastId } = res.data
        assetRows.forEach((ar) => {
          assets.push(ar)
        })
        if (lastId === null) {
          break
        }
        minIdNonInclusive = lastId
      } catch(e) {
        errors.merge(["[ASSETS]: Something went wrong fetching the list of available assets"])
        return
      }
    }
    return assets
  }, [runIds])

  const clearFileData = useCallback((file: 'file1' | 'file2') => {
    console.log('xcxc clearing data', file)
    runIds.current[file] = undefined
    if (file === 'file1') {
      file1State.set({ ...defaultProcessedState })
    } else if (file === 'file2') {
      file2State.set({ ...defaultProcessedState })
    } else {
      unreachable(file)
    }
  }, [file1State, file2State])
  const refreshFileData = useCallback(async (file: 'file1' | 'file2') => {
    clearFileData(file)
    const filesState = files.get()
    let fileId: number | undefined = undefined
    if (filesState.status !== "LOADED") {
      errors.merge(`[FILES]: Unable to refresh data for ${file}, file data is not yet loaded`)
      return
    } else {
      if (file === 'file1') {
        fileId = filesState.selectedFileId1
      } else if (file === 'file2') {
        fileId = filesState.selectedFileId2
      } else {
        unreachable(file)
      }
    }
    const currentRunId = Math.random()
    runIds.current[file] = currentRunId
    const moduleRows = await queryModules({
      file,
      fileId,
      currentRunId,
    })
    const chunkRows = await queryChunks({
      file,
      fileId,
      currentRunId,
    })
    const namedChunkGroupRows = await queryNamedChunkGroups({
      file,
      fileId,
      currentRunId,
    })
    const assetRows = await queryAssets({
      file,
      fileId,
      currentRunId,
    })
    if (currentRunId !== runIds.current[file]) {
      console.log(`xcxc canceled processing for file ${file}`)
      return
    }
    const processedState = processState({
      moduleRows,
      chunkRows,
      namedChunkGroupRows,
      assetRows,
    })
    if (file === 'file1') {
      file1State.set(processedState)
    } else if (file === 'file2') {
      file2State.set(processedState)
    } else {
      unreachable(file)
    }
  }, [files, file1State, file2State, errors, runIds])

  return {
    refreshFileData,
    clearFileData,
  }
}

