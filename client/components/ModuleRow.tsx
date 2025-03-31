import "./styles/ModuleRow.css"
import { JsonViewer } from '@textea/json-viewer'
import { ProcessedChunkInfo, ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { ImmutableMap, ImmutableObject, useHookstate } from '@hookstate/core'
import { Link } from 'react-router'
import { getHumanReadableChunkName } from '../helpers/chunks'
import { ModuleLink } from './ModuleLink'
import { ChunkLink } from './ChunkLink'

export function ModuleRow(props: {
  module: ImmutableObject<ProcessedModuleInfo>
  showRawInfo: boolean,
  setShowRawInfo: (moduleDatabaseId: number) => void
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
}) {
  const {
    module,
    showRawInfo,
    setShowRawInfo,
    modulesByDatabaseId,
    chunksByDatabaseId,
  } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={module.rawFromWebpack} />
    : null

  const numTotalModules = module.rawFromWebpack.modules?.length || 1
  const depth = module.pathFromEntry.length
  const shortestPath = module.pathFromEntry.map((moduleDatabaseId) => {
    const m = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <li key={moduleDatabaseId}>
        <ModuleLink module={m} file={"file1"} />
      </li>
    )
  })
  const chunkParents = module.parentChunkDatabaseIds.map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <li key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </li>
    )
  })

  const maxChildrenToShow = 10
  const maxParentsToShow = 10
  const children = Array.from(module.childModules.values()).slice(0, maxChildrenToShow).map((relationship) => {
    const moduleDatabaseId = relationship.childModuleDatabaseId
    const m = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <li key={moduleDatabaseId}>
        <ModuleLink module={m} file={"file1"} />
      </li>
    )
  })
  const parents = Array.from(module.parentModules.values()).slice(0, maxParentsToShow).map((relationship) => {
    const moduleDatabaseId = relationship.parentModuleDatabaseId
    const m = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <li key={moduleDatabaseId}>
        <ModuleLink module={m} file={"file1"} />
      </li>
    )
  })

  return <div className="moduleRow">
    <div>
      <p>Name: {module.rawFromWebpack.name}</p>
      <p>Depth: { depth === 0 ? "Not a descendant of any entry point file" : depth }</p>
      <p>Size: ~{Math.round(module.rawFromWebpack.size / 1024)} kb</p>
      <p># Optimization Bailouts: { module.rawFromWebpack.optimizationBailout?.length || 0 }</p>
      <p>Module Was Concatenated?: { numTotalModules > 1 ? `Yes, to ${numTotalModules -1} other modules` : 'No' }</p>
      <div>
        <h5>Chunk Parent(s)</h5>
        <ul>
          {chunkParents}
        </ul>
      </div>
      <div>
        <h5>Shortest path to entry point</h5>
        <ul>
          {shortestPath}
        </ul>
      </div>
      <div>
        <h5>Module Children ({module.childModules.size} total -- will only show up to {maxChildrenToShow})</h5>
        <ul>
          {children}
        </ul>
      </div>
      <div>
        <h5>Module Parents ({module.parentModules.size} total -- will only show up to {maxParentsToShow})</h5>
        <ul>
          {parents}
        </ul>
      </div>
      <button onClick={() => { if (showRawInfo) { setShowRawInfo(-1) } else { setShowRawInfo(module.moduleDatabaseId)}}}>{ showRawInfo ? "Hide": "Show"} Raw JSON</button>
    </div>
    {rawInfo}
  </div>
}