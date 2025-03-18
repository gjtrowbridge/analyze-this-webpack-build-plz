import {ModuleExtraInfo, ModuleIdentifier} from "../helpers/modules"
import type {StatsModule} from "webpack"
import { noDepthFoundConstant } from '../helpers/modules'
import "./styles/ModuleRow.css"
import { JsonViewer } from '@textea/json-viewer'

export function ModuleRow(props: {
  module: StatsModule,
  extraInfo?: ModuleExtraInfo,
  showRawInfo: boolean,
  setShowRawInfo: (moduleId: ModuleIdentifier) => void
}) {
  const { module, extraInfo, showRawInfo, setShowRawInfo } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={module} />
    : null

  const numTotalModules = module.modules?.length || 1

  return <div className="moduleRow">
    <div>
      <p>Name: {module.name}</p>
      { extraInfo ? (<p>Depth: { extraInfo.depth === noDepthFoundConstant ? "Not a descendant of any entry point file" : extraInfo.depth }</p>) : null }
      <p>Size: ~{Math.round(module.size / 1024)} kb</p>
      <p># Optimization Bailouts: { module.optimizationBailout?.length || 0 }</p>
      <p>Module Was Concatenated?: { numTotalModules > 1 ? `Yes, to ${numTotalModules -1} other modules` : 'No' }</p>
      <button onClick={() => { if (showRawInfo) { setShowRawInfo("") } else { setShowRawInfo(module.identifier)}}}>{ showRawInfo ? "Hide": "Show"} Raw JSON</button>
    </div>
    {rawInfo}
  </div>
}