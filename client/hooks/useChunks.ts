import type { StatsChunk } from 'webpack'
import { useCallback, useEffect } from 'react'
import axios from 'axios'
import type { ReactChunkState } from '../types'
import { ChunkRow } from '../../shared/types'
import { useHookstate } from '@hookstate/core'
import { chunksStateFile1, chunksStateFile2, errorsState } from '../globalState'
import { useFileIds } from './useFiles'


export function useChunks() {
  const csf1 = useHookstate(chunksStateFile1)
  const csf2 = useHookstate(chunksStateFile2)
  const fileIds = useFileIds()

  const chunksState1 = csf1.get()
  const setChunksState1 = useCallback((cs: ReactChunkState) => {
    csf1.set(cs)
  }, [])
  const chunksState2 = csf1.get()
  const setChunksState2 = useCallback((cs: ReactChunkState) => {
    csf2.set(cs)
  }, [])

  useUpdateChunksForFile({
    fileId: fileIds.file1,
    alreadyUpToDate: Boolean(chunksState1?.ready),
    setChunksState: setChunksState1,
  })
  useUpdateChunksForFile({
    fileId: fileIds.file2,
    alreadyUpToDate: Boolean(chunksState2?.ready),
    setChunksState: setChunksState2,
  })
}

export function useUpdateChunksForFile(args: {
  fileId: number | null
  alreadyUpToDate: boolean
  setChunksState: (rcs: ReactChunkState) => void
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
    const chunks: Array<StatsChunk> = []
    void (async () => {
      while (!shouldStopEarly) {
        setChunksState({
          ready: false,
          statusMessage: `Getting the ${limit} chunks after id: ${minIdNonInclusive} for file: "${fileId}"`,
        })
        try {
          const res = await axios.get<{
            chunkRows: Array<ChunkRow>
            lastId: number | null
          }>(`/api/chunks/${fileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
          const { chunkRows, lastId } = res.data
          chunkRows.forEach((cr) => {
            const chunk: StatsChunk = JSON.parse(cr.raw_json)
            chunks.push(chunk)
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
        statusMessage: `Done loading chunks for file: "${fileId}"`,
        chunks,
      })
    })()

  }, [fileId, setChunksState, alreadyUpToDate])
}
