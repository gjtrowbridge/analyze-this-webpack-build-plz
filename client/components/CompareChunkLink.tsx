import { Link } from 'react-router'
import { Typography } from '@mui/material'
import { ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { getHumanReadableChunkName } from '../helpers/chunks'

interface CompareChunkLinkProps {
  chunk1: ProcessedChunkInfo
  chunk2: ProcessedChunkInfo
}

export function CompareChunkLink(props: CompareChunkLinkProps) {
  const { chunk1, chunk2 } = props

  const chunk1Name = getHumanReadableChunkName(chunk1)
  const chunk2Name = getHumanReadableChunkName(chunk2)

  return (
    <Link to={`/comparison/chunks/${chunk1.chunkDatabaseId}/${chunk2.chunkDatabaseId}`}>
      <Typography component="span" color="primary">
        {`Compare "${chunk1Name}" (File 1) with "${chunk2Name}" (File 2)`}
      </Typography>
    </Link>
  )
} 