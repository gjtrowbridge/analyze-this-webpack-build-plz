import { ImmutableObject } from '@hookstate/core'
import { ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { Link } from 'react-router'
import { FileNumber } from '../types'
import { getHumanReadableChunkName } from '../helpers/chunks'
import { getHumanReadableSize } from '../helpers/math'
export function ChunkLink(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  file: FileNumber
  includeFileInfo?: boolean
  includeAssociatedAssets?: boolean
  includeSize?: boolean
}) {
  const {
    chunk,
    file,
    includeFileInfo,
    includeAssociatedAssets,
    includeSize,
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
  if (includeSize) {
    linkText = linkText.concat(` (${getHumanReadableSize(chunk.rawFromWebpack.size)})`)
  }
  return (
    <Link to={`/chunks/${file}/${chunk.chunkDatabaseId}`}>
      {linkText}
    </Link>
  )
}
