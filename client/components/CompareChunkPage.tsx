import { useParams } from 'react-router'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState, file2ProcessedGlobalState } from '../globalState'
import { convertToInteger } from '../../server/helpers/misc'
import { Box, Typography, Alert } from '@mui/material'
import { ChunkRow } from './ChunkRow'
import { useState } from 'react'

export function CompareChunkPage() {
  const params = useParams()
  const chunkDatabaseIdFile1 = convertToInteger(params.chunkDatabaseIdFile1)
  const chunkDatabaseIdFile2 = convertToInteger(params.chunkDatabaseIdFile2)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)
  const [showMoreId, setShowMoreId] = useState<number>(-1)

  const file1OrNull = file1ProcessedState.ornull
  const file2OrNull = file2ProcessedState.ornull

  if (file1OrNull === null || file2OrNull === null) {
    return <p>Loading chunk information...</p>
  }

  const file1Chunk = file1ProcessedState.chunksByDatabaseId.get().get(chunkDatabaseIdFile1)
  const file2Chunk = file2ProcessedState.chunksByDatabaseId.get().get(chunkDatabaseIdFile2)

  if (!file1Chunk && !file2Chunk) {
    return <Alert severity="warning">One or more chunks were not found</Alert>
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Chunk Comparison
      </Typography>
      
      {file1Chunk && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5">File 1:</Typography>
          <ChunkRow
            file="file1"
            chunk={file1Chunk}
            showRawInfo={showMoreId === file1Chunk.chunkDatabaseId}
            setShowRawInfo={setShowMoreId}
            modulesByDatabaseId={file1ProcessedState.modulesByDatabaseId.get()}
            chunksByDatabaseId={file1ProcessedState.chunksByDatabaseId.get()}
            namedChunkGroupsByDatabaseId={file1ProcessedState.namedChunkGroupsByDatabaseId.get()}
          />
        </Box>
      )}

      {file2Chunk && (
        <Box>
          <Typography variant="h5">File 2:</Typography>
          <ChunkRow
            file="file2"
            chunk={file2Chunk}
            showRawInfo={showMoreId === file2Chunk.chunkDatabaseId}
            setShowRawInfo={setShowMoreId}
            modulesByDatabaseId={file2ProcessedState.modulesByDatabaseId.get()}
            chunksByDatabaseId={file2ProcessedState.chunksByDatabaseId.get()}
            namedChunkGroupsByDatabaseId={file2ProcessedState.namedChunkGroupsByDatabaseId.get()}
          />
        </Box>
      )}
    </Box>
  )
}

