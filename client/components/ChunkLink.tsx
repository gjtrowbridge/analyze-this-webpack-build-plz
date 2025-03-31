import { ImmutableObject } from '@hookstate/core'
import { ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { Link } from 'react-router'
import { FileNumber } from '../types'
import { getHumanReadableChunkName } from '../helpers/chunks'

export function ChunkLink(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  file: FileNumber
  includeFileInfo?: boolean
}) {
  const {
    chunk,
    file,
    includeFileInfo,
  } = props
  let linkText = getHumanReadableChunkName(chunk)
  if (includeFileInfo) {
    linkText = linkText.concat(` ${file}`)
  }
  return (
    <Link to={`/chunks/${file}/${chunk.chunkDatabaseId}`}>
      {linkText}
    </Link>
  )
}
