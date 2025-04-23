import { useParams } from 'react-router'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState, file2ProcessedGlobalState } from '../globalState'
import { convertToInteger } from '../../server/helpers/misc'
import { Box, Typography } from '@mui/material'
import { ChunkLink } from './ChunkLink'

export function CompareChunkPage() {
  const params = useParams()
  const chunkDatabaseId = convertToInteger(params.chunkDatabaseIdFile1)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)

  const file1OrNull = file1ProcessedState.ornull
  const file2OrNull = file2ProcessedState.ornull

  if (file1OrNull === null || file2OrNull === null) {
    return <p>Loading chunk information...</p>
  }

  const file1Chunk = file1ProcessedState.chunksByDatabaseId.get().get(chunkDatabaseId)
  const file2Chunk = file2ProcessedState.chunksByDatabaseId.get().get(chunkDatabaseId)

  if (!file1Chunk && !file2Chunk) {
    return <p>No chunks found with id: {chunkDatabaseId}</p>
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Chunk Comparison
      </Typography>
      
      {file1Chunk && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5">File 1:</Typography>
          <ChunkLink chunk={file1Chunk} file="file1" includeAssociatedAssets={true} />
        </Box>
      )}

      {file2Chunk && (
        <Box>
          <Typography variant="h5">File 2:</Typography>
          <ChunkLink chunk={file2Chunk} file="file2" includeAssociatedAssets={true} />
        </Box>
      )}
    </Box>
  )
}

