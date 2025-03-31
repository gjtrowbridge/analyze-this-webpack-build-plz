import { ImmutableObject } from '@hookstate/core'
import { ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { Link } from 'react-router'
import { FileNumber } from '../types'

export function ModuleLink(props: {
  module: ImmutableObject<ProcessedModuleInfo>
  file: FileNumber
  includeFileInfo?: boolean
}) {
  const {
    module,
    file,
    includeFileInfo,
  } = props
  let linkText = module.rawFromWebpack.name
  if (includeFileInfo) {
    linkText = linkText.concat(` ${file}`)
  }
  return (
    <Link to={`/modules/${file}/${module.moduleDatabaseId}`}>
      {linkText}
    </Link>
  )
}
