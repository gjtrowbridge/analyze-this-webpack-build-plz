import "./styles/ChunkRow.css"
import { JsonViewer } from '@textea/json-viewer'
import { ProcessedChunkInfo, ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { getHumanReadableChunkName } from '../helpers/chunks'
import { Link } from 'react-router'
import { getModuleIdentifierKey } from '../helpers/modules'


export function ChunkRow(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  showRawInfo: boolean,
  setShowRawInfo: (chunkDatabaseId: number) => void
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
}) {
  const { chunk, showRawInfo, setShowRawInfo, chunksByDatabaseId, modulesByDatabaseId } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={chunk} />
    : null

  const maxModuleChildrenToShow = 10

  const childModules = Array.from(chunk.childModuleDatabaseIds).slice(0, maxModuleChildrenToShow).map((moduleDatabaseId) => {
    const module = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <li key={moduleDatabaseId}>
        <Link to={`/modules/${moduleDatabaseId}`}>{module.rawFromWebpack.name}</Link>
      </li>
    )
  })

  const maxChunkParentsToShow = 10
  const maxChunkChildrenToShow = 10
  const maxChunkSiblingsToShow = 10

  const chunkParents = Array.from(chunk.parentChunkDatabaseIds).slice(0, maxChunkParentsToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <li key={chunkDatabaseId}>
        <Link to={`/chunks/${chunkDatabaseId}`}>{getHumanReadableChunkName(chunk)}</Link>
      </li>
    )
  })
  const chunkChildren = Array.from(chunk.childChunkDatabaseIds).slice(0, maxChunkChildrenToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <li key={chunkDatabaseId}>
        <Link to={`/chunks/${chunkDatabaseId}`}>{getHumanReadableChunkName(chunk)}</Link>
      </li>
    )
  })
  const chunkSiblings = Array.from(chunk.siblingChunkDatabaseIds).slice(0, maxChunkSiblingsToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <li key={chunkDatabaseId}>
        <Link to={`/chunks/${chunkDatabaseId}`}>{getHumanReadableChunkName(chunk)}</Link>
      </li>
    )
  })

  return (
    <div className="chunkRow">
      <div>
        <p>Id: {chunk.rawFromWebpack.id}</p>
        <p>Name(s): {getHumanReadableChunkName(chunk)}</p>
        <p>Size: {Math.round(chunk.rawFromWebpack.size / 1024)} kb</p>
        <p>Generated Asset Name(s): {chunk.rawFromWebpack.files?.join(", ")}</p>
        <div>
          <h5>Chunk Parents ({chunk.parentChunkDatabaseIds.size} total -- will only show up to {maxChunkParentsToShow})</h5>
          <ul>
            {chunkParents}
          </ul>
        </div>
        <div>
          <h5>Chunk Children ({chunk.childChunkDatabaseIds.size} total -- will only show up to {maxChunkChildrenToShow})</h5>
          <ul>
            {chunkChildren}
          </ul>
        </div>
        <div>
          <h5>Chunk Siblings ({chunk.siblingChunkDatabaseIds.size} total -- will only show up to {maxChunkSiblingsToShow})</h5>
          <ul>
            {chunkSiblings}
          </ul>
        </div>
        <div>
          <h5>Module Children ({chunk.childModuleDatabaseIds.size} total -- will only show up to {maxModuleChildrenToShow})</h5>
          <ul>
            {childModules}
          </ul>
        </div>
        <button onClick={() => { if (showRawInfo) { setShowRawInfo(-1) } else { setShowRawInfo(chunk.chunkDatabaseId)}}}>Show {showRawInfo ? "Less" : "More"}</button>
      </div>
      {rawInfo}
    </div>
  )
}
