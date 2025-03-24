import type { StatsChunk } from 'webpack'
import { useEffect } from 'react'
import axios from 'axios'
import type { ReactChunkState } from '../types'
import { ChunkRow, ModuleRow } from '../../shared/types'


export function useChunks(args: {
  chunkState: ReactChunkState
  selectedFileId: number,
  setChunkState: (newValue: ReactChunkState) => void
  isEnabled: boolean
  setErrorMessage: (errorMessage: string) => void
}) {
  const { chunkState, selectedFileId, setErrorMessage, setChunkState, isEnabled } = args
  useEffect(() => {
    if (selectedFileId === null) {
      return
    }
    let limit = 200
    let minIdNonInclusive = -1
    let shouldStopEarly = false
    if (chunkState.ready || !isEnabled) {
      return
    }
    console.log(`Querying chunks for ${selectedFileId}...`)
    const chunks: Array<StatsChunk> = []
    void (async () => {
      while (!shouldStopEarly) {
        setChunkState({
          ready: false,
          statusMessage: `Getting the ${limit} modules after id: ${minIdNonInclusive} for file: "${selectedFileId}"`,
        })
        const res = await axios.get<{
          chunkRows: Array<ChunkRow & { id: number }>
          lastId: number | null
        }>(`/api/chunks/${selectedFileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
        if (res.status > 300) {
          setErrorMessage(`Something went wrong when loading the chunks...`)
          break
        }
        const { chunkRows, lastId } = res.data
        chunkRows.forEach((cr) => {
          const chunk: StatsChunk = JSON.parse(cr.raw_json)
          chunks.push(chunk)
        })
        if (lastId === null) {
          break
        }
        minIdNonInclusive = lastId
        console.log('last chunk id', lastId)
      }
      setChunkState({
        ready: true,
        statusMessage: `Done loading chunks for file: "${selectedFileId}"`,
        chunks,
      })
    })()
    return () => { shouldStopEarly = true }
  }, [setErrorMessage, selectedFileId, setChunkState, chunkState.ready, isEnabled]);
}
