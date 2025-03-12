import type { StatsChunk } from 'webpack'
import { useEffect } from 'react'
import axios from 'axios'
import type { ReactChunkState } from '../types'


export function useChunks(args: {
  chunkState: ReactChunkState
  selectedFile: string | null,
  setChunkState: (newValue: ReactChunkState) => void
  isEnabled: boolean
  setErrorMessage: (errorMessage: string) => void
}) {
  const { chunkState, selectedFile, setErrorMessage, setChunkState, isEnabled } = args
  useEffect(() => {
    if (selectedFile === null) {
      return
    }
    let offset = 0
    let limit = 100
    let shouldStopEarly = false
    if (chunkState.ready || !isEnabled) {
      return
    }
    console.log(`Querying chunks for ${selectedFile}...`)
    const chunks: Array<StatsChunk> = []
    void (async () => {
      while (!shouldStopEarly) {
        setChunkState({
          ready: false,
          statusMessage: `Getting chunks ${offset} -> ${offset + limit - 1} for file: "${selectedFile}"`,
        })
        const res = await axios.get<{ chunks?: Array<StatsChunk>}>(`/api/chunks/${selectedFile}?offset=${offset}&limit=${limit}`)
        if (res.status > 300) {
          setErrorMessage(`Something went wrong when loading the chunks...`)
          break
        }
        const chunksFromRequest = res.data.chunks || []
        chunksFromRequest.forEach((m) => {
          chunks.push(m)
        })
        if (chunksFromRequest.length < limit) {
          break
        }
        offset += limit
        console.log('bumping offset', offset, limit)
      }
      setChunkState({
        ready: true,
        statusMessage: `Done loading chunks for file: "${selectedFile}"`,
        chunks,
      })
    })()
    return () => { shouldStopEarly = true }
  }, [setErrorMessage, selectedFile, setChunkState, chunkState.ready, isEnabled]);
}
