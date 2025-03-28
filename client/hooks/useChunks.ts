import type { StatsChunk } from 'webpack'
import { useCallback, useEffect } from 'react'
import axios from 'axios'
import type { ReactChunkState } from '../types'
import { ChunkRow } from '../../shared/types'
import { ImmutableObject, useHookstate } from '@hookstate/core'
import {
  chunksStateFile1,
  chunksStateFile2,
  errorsState,
  file1ChunksGlobalState,
  file2ChunksGlobalState
} from '../globalState'
import { useFileIds } from './useFiles'


export function useChunks() {
  const chunks1 = useHookstate(file1ChunksGlobalState)
  const chunks2 = useHookstate(file2ChunksGlobalState)
  const fileIds = useFileIds()

  const chunksState1 = chunks1.get()
  const setChunksState1 = useCallback((cs: ImmutableObject<{
    ready: boolean,
    chunks: Array<ChunkRow>
  }>) => {
    chunks1.set(cs)
  }, [])
  const chunksState2 = chunks2.get()
  const setChunksState2 = useCallback((cs: ImmutableObject<{
    ready: boolean,
    chunks: Array<ChunkRow>
  }>) => {
    chunks2.set(cs)
  }, [])

  useUpdateChunksForFile({
    fileId: fileIds.file1,
    alreadyUpToDate: Boolean(chunksState1.ready),
    setChunksState: setChunksState1,
  })
  useUpdateChunksForFile({
    fileId: fileIds.file2,
    alreadyUpToDate: Boolean(chunksState2.ready),
    setChunksState: setChunksState2,
  })
}

export function useUpdateChunksForFile(args: {
  fileId: number | null
  alreadyUpToDate: boolean
  setChunksState: (cs: ImmutableObject<{
    ready: boolean
    chunks: Array<ChunkRow>
  }>) => void
}) {
  const { fileId, alreadyUpToDate, setChunksState } = args
  const errors = useHookstate(errorsState)
  useEffect(() => {
    if (fileId === null || alreadyUpToDate) {
      return
    }
    console.log('xcxc querying chunks for file', fileId)
    let limit = 200
    let minIdNonInclusive = -1
    let shouldStopEarly = false
    const chunks: Array<ChunkRow> = []
    void (async () => {
      while (!shouldStopEarly) {
        try {
          const res = await axios.get<{
            chunkRows: Array<ChunkRow>
            lastId: number | null
          }>(`/api/chunks/${fileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
          const { chunkRows, lastId } = res.data
          chunkRows.forEach((cr) => {
            chunks.push(cr)
          })
          if (lastId === null) {
            break
          }
          minIdNonInclusive = lastId
          console.log('last chunk id...', lastId)
        } catch(e) {
          errors.merge(["[CHUNKS]: Something went wrong fetching the list of available chunks"])
          return
        }
      }
      setChunksState({
        ready: true,
        chunks,
      })
    })()

  }, [fileId, setChunksState, alreadyUpToDate])
}
