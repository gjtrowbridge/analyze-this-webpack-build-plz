import "./styles/ChunkRow.css"
import { JsonViewer } from '@textea/json-viewer'
import { ProcessedChunkInfo, ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { getHumanReadableChunkName } from '../helpers/chunks'
import { ModuleLink } from './ModuleLink'
import { ChunkLink } from './ChunkLink'


export function ChunkRow(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  showRawInfo: boolean,
  setShowRawInfo: (chunkDatabaseId: number) => void
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
  noLimitsOnLists?: boolean
}) {
  const {
    chunk,
    showRawInfo,
    setShowRawInfo,
    chunksByDatabaseId,
    modulesByDatabaseId,
    noLimitsOnLists,
  } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={chunk} />
    : null

  const maxModuleChildrenToShow = noLimitsOnLists ? 100000 : 10

  const childModules = Array.from(chunk.childModuleDatabaseIds).slice(0, maxModuleChildrenToShow).map((moduleDatabaseId) => {
    const module = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <li key={moduleDatabaseId}>
        <ModuleLink module={module} file={"file1"} />
      </li>
    )
  })

  const maxChunkParentsToShow = noLimitsOnLists ? 100000 : 10
  const maxChunkChildrenToShow = noLimitsOnLists ? 100000 : 10
  const maxChunkSiblingsToShow = noLimitsOnLists ? 100000 : 10

  const chunkParents = Array.from(chunk.parentChunkDatabaseIds).slice(0, maxChunkParentsToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <li key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </li>
    )
  })
  const chunkChildren = Array.from(chunk.childChunkDatabaseIds).slice(0, maxChunkChildrenToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <li key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </li>
    )
  })
  const chunkSiblings = Array.from(chunk.siblingChunkDatabaseIds).slice(0, maxChunkSiblingsToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <li key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </li>
    )
  })

  return (
    <div className="chunkRow">
      <div>
        <p>Webpack Id: {chunk.rawFromWebpack.id}</p>
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
