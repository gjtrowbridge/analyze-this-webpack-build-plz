import { useCallback, useRef, useState } from 'react'
import { ChunkRow, ModuleRow } from '../../shared/types'
import axios from 'axios'
import { useHookstate } from '@hookstate/core'
import {
  defaultProcessedState,
  errorsGlobalState,
  file1ProcessedGlobalState,
  file2ProcessedGlobalState,
  filesGlobalState
} from '../globalState'
import { ProcessedState, processModulesAndChunks } from '../helpers/processModulesAndChunks'
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
  const [rawState1, setRawState1] = useState<ProcessedState>({ ...defaultProcessedState })
  const [rawState2, setRawState2] = useState<ProcessedState>({ ...defaultProcessedState })

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

    const limit = 50
    let minIdNonInclusive = -1
    const modules: Array<ModuleRow> = []
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
        const percentageDone = getPercentage({
          numerator: modules.length,
          denominator: fileRow.modules_count,
        })
        console.log(`QUERYING FOR MODULES: ${percentageDone}`)
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
  }, [runIds, errors, files])
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

  const clearFileData = useCallback((file: 'file1' | 'file2') => {
    console.log('xcxc clearing data', file)
    runIds.current[file] = undefined
    if (file === 'file1') {
      setRawState1({ ...defaultProcessedState })
      file1State.set({ ...defaultProcessedState })
    } else if (file === 'file2') {
      setRawState2({ ...defaultProcessedState })
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
    if (currentRunId !== runIds.current[file]) {
      console.log(`xcxc canceled processing for file ${file}`)
      return
    }
    const processedState = processModulesAndChunks({
      moduleRows,
      chunkRows,
    })
    if (file === 'file1') {
      // setRawState1(processedState)
      file1State.set(processedState)
    } else if (file === 'file2') {
      // setRawState2(processedState)
      file2State.set(processedState)
    } else {
      unreachable(file)
    }
  }, [files, file1State, file2State, errors, runIds, setRawState1, setRawState2])

  return {
    refreshFileData,
    clearFileData,
    rawState1,
    rawState2,
  }
}

