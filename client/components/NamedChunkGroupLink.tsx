import { ImmutableObject } from '@hookstate/core'
import { ProcessedNamedChunkGroupInfo } from '../helpers/processModulesAndChunks'
import { Link } from 'react-router'
import { FileNumber } from '../types'

export function NamedChunkGroupLink(props: {
  namedChunkGroup: ImmutableObject<ProcessedNamedChunkGroupInfo>
  file: FileNumber
  includeFileInfo?: boolean
}) {
  const {
    namedChunkGroup,
    file,
    includeFileInfo,
  } = props
  let linkText = `Named Chunk Group: "${namedChunkGroup.name}"`
  if (includeFileInfo) {
    linkText = linkText.concat(` ${file}`)
  }
  return (
    <Link to={`/named-chunk-groups/${file}/${namedChunkGroup.namedChunkGroupDatabaseId}`}>
      {linkText}
    </Link>
  )
}
