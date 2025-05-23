import { ImmutableObject } from '@hookstate/core'
import { ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { Link } from 'react-router'
import { FileNumber } from '../types'
import { getModuleExtraSizeDueToDuplication } from '../helpers/modules'
import { getHumanReadableSize } from '../helpers/math'

export function ModuleLink(props: {
  module: ImmutableObject<ProcessedModuleInfo>
  file: FileNumber
  includeFileInfo?: boolean
  includeDuplicationAmount?: boolean
}) {
  const {
    module,
    file,
    includeFileInfo,
    includeDuplicationAmount,
  } = props
  let linkText = module.rawFromWebpack.name
  if (includeFileInfo) {
    linkText = linkText.concat(` (${file})`)
  }
  if (includeDuplicationAmount) {
    linkText = linkText.concat(` (Extra Size Due To Duplication: ${getHumanReadableSize(getModuleExtraSizeDueToDuplication({
      module,
      basedOnIndividualModules: true,
    }))})`)
  }
  return (
    <Link to={`/modules/${file}/${module.moduleDatabaseId}`}>
      {linkText}
    </Link>
  )
}
