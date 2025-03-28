import {ModuleExtraInfo, ModuleIdentifier} from "../helpers/modules"
import type {StatsModule} from "webpack"
import { noDepthFoundConstant } from '../helpers/modules'
import "./styles/ModuleRow.css"
import { JsonViewer } from '@textea/json-viewer'
import { ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { ImmutableObject } from '@hookstate/core'

export function ModuleRow(props: {
  module: ImmutableObject<ProcessedModuleInfo>
  showRawInfo: boolean,
  setShowRawInfo: (moduleDatabaseId: number) => void
}) {
  const { module, showRawInfo, setShowRawInfo } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={module.rawFromWebpack} />
    : null

  const numTotalModules = module.rawFromWebpack.modules?.length || 1
  const depth = module.pathFromEntry.length

  return <div className="moduleRow">
    <div>
      <p>Name: {module.rawFromWebpack.name}</p>
      <p>Depth: { depth === 0 ? "Not a descendant of any entry point file" : depth }</p>
      <p>Size: ~{Math.round(module.rawFromWebpack.size / 1024)} kb</p>
      <p># Optimization Bailouts: { module.rawFromWebpack.optimizationBailout?.length || 0 }</p>
      <p>Module Was Concatenated?: { numTotalModules > 1 ? `Yes, to ${numTotalModules -1} other modules` : 'No' }</p>
      <button onClick={() => { if (showRawInfo) { setShowRawInfo(-1) } else { setShowRawInfo(module.moduleDatabaseId)}}}>{ showRawInfo ? "Hide": "Show"} Raw JSON</button>
    </div>
    {rawInfo}
  </div>
}