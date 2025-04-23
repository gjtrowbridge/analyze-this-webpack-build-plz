import { ImmutableObject } from '@hookstate/core'
import { ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { Link } from 'react-router'
import { FileNumber } from '../types'
import { getHumanReadableChunkName } from '../helpers/chunks'

export function ChunkLink(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  file: FileNumber
  includeFileInfo?: boolean
  includeAssociatedAssets?: boolean
}) {
  const {
    chunk,
    file,
    includeFileInfo,
    includeAssociatedAssets,
  } = props
  let linkText = getHumanReadableChunkName(chunk)
  if (includeFileInfo) {
    linkText = linkText.concat(` ${file}`)
  }
  if (includeAssociatedAssets) {
    const number = chunk.rawFromWebpack.files?.length || 0
    if (number > 1) {
      linkText = linkText.concat(` (${number} associated assets)`)
    } else if (number === 1) {
      linkText = linkText.concat(` (${number} associated asset)`)
    }
  }
  return (
    <Link to={`/chunks/${file}/${chunk.chunkDatabaseId}`}>
      {linkText}
    </Link>
  )
}
