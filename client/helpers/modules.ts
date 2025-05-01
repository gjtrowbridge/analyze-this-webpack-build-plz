import { ProcessedModuleInfo } from './processModulesAndChunks'
import { ImmutableObject } from '@hookstate/core'

export function getModuleIdentifier(module: ImmutableObject<ProcessedModuleInfo> | null) {
  return getModuleIdentifierKey(module?.rawFromWebpack.identifier || null)
}

export function getModuleSize(args: {
  module: ImmutableObject<ProcessedModuleInfo>,
  // If true, uses the total of this module AND its submodules
  includeSubModules?: boolean
}) {
  const { module, includeSubModules } = args
  /**
   * If including submodules, or if this doesn't have concatenated submodules, we can use the default
   * top-level size.
   */
  if (Boolean(includeSubModules) || module.innerConcatenatedModuleDatabaseIds.size === 0) {
    return module.rawFromWebpack.size
  }

  /**
   * If we do NOT want to include submodules, we should just use the individual size of this module
   * prior to it getting more modules concatenated onto it
   */
  const individualModule = getIndividualModuleData(module)

  return individualModule.size
}

/**
 * Gets the raw webpack module data, and notably gets the individual raw data from the submodules, if any
 * This helper method mostly helps us do size calcs, etc for concatenated modules
 * See #ConcatenatedModules for more info
 */
function getIndividualModuleData(module: ImmutableObject<ProcessedModuleInfo>) {
  const superModuleWebpackId = getModuleIdentifier(module)
  return module.rawFromWebpack.modules.find((m) => {
    const submoduleWebpackId = getModuleIdentifierKey(m.identifier)
    return submoduleWebpackId === superModuleWebpackId
  }) ?? module.rawFromWebpack
}

/**
 * Strip out some parts of the stats.json moduleIdentifier to make it
 * internally consistent.
 *
 * Basically, what I observed is that in the "reasons" section of modules,
 * there would be "reasons" that referenced a moduleIdentifier, but the
 * module itself had that same identifier PLUS some extra crap on the end.
 * This removes that extra crap so we can properly match modules up with their
 * parents and children in (hopefully) almost all cases.
 */
export function getModuleIdentifierKey(moduleIdentifier: string | null) {
  if (moduleIdentifier === null) {
    return '~~null~~'
  }
  const regexToReplace = /\|[a-zA-Z0-9]+$/
  return moduleIdentifier.replace(regexToReplace, '')
}

/**
 * Returns the number of chunks that have this module in it
 */
export function getModuleNumberOfChunks(m: ImmutableObject<ProcessedModuleInfo>): number {
  return m.rawFromWebpack.chunks?.length ?? 0
}

/**
 * Calculates the amount of extra code in our bundle that is a direct result of this module
 * being duplicated across many chunks
 */
export function getModuleExtraSizeDueToDuplication(args: {
  module: ImmutableObject<ProcessedModuleInfo>,
  // If true, uses the total of this module AND its submodules
  includeSubModules?: boolean
}): number {
  const { module } = args
  const numChunks = getModuleNumberOfChunks(module)
  const size = getModuleSize(args)
  if (numChunks === 0) {
    return 0
  }
  return size * (numChunks - 1)
}