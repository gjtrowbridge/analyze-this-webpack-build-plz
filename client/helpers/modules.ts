import { ProcessedModuleInfo } from './processModulesAndChunks'
import { ImmutableObject } from '@hookstate/core'

export function getModuleIdentifier(module: ImmutableObject<ProcessedModuleInfo> | null) {
  return getModuleIdentifierKey(module?.rawFromWebpack.identifier || null)
}

export function getModuleSize(args: {
  module: ImmutableObject<ProcessedModuleInfo> | undefined,
  // If true, uses the total of this module AND its submodules
  includeSubModules?: boolean
}) {
  const { module, includeSubModules } = args

  if (!module) {
    return 0
  }

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
export function getModuleNumberOfChunks(args: {
  module: ImmutableObject<ProcessedModuleInfo> | undefined,
  // See #ConcatenatedModules
  // If true, also counts the chunks the module is in as a result of the location of the module's supermodule
  includeChunksFromSuperModules?: boolean
}): number {
  const { module, includeChunksFromSuperModules } = args
  const directChunks = module?.parentChunkDatabaseIds.size ?? 0
  const chunksFromSuperModulesIfAny = module?.parentChunkDatabaseIdsFromSuperModule.size ?? 0
  if (!includeChunksFromSuperModules) {
    return directChunks
  }
  return directChunks + chunksFromSuperModulesIfAny
}

/**
 * Calculates the amount of extra code in our bundle that is a direct result of this module
 * being duplicated across many chunks
 */
export function getModuleExtraSizeDueToDuplication(args: {
  module: ImmutableObject<ProcessedModuleInfo>,
  // If true, shows the duplication size JUST for a single code file, ignoring the effects of ModuleConcatenationPlugin
  // If false, shows the duplication size for an entire concatenated module (which is harder to reason about IMO)
  basedOnIndividualModules: boolean
}): number {
  const { module, basedOnIndividualModules } = args
  const numChunks = getModuleNumberOfChunks({
    module,
    includeChunksFromSuperModules: basedOnIndividualModules,
  })
  const size = getModuleSize({ module, includeSubModules: !basedOnIndividualModules })
  if (numChunks === 0) {
    return 0
  }
  return size * (numChunks - 1)
}

export function getModuleName(args: {
  module: ImmutableObject<ProcessedModuleInfo>,
  // If true, will return the name of just the individual module, instead of the extra " + X modules"
  // that gets added when ModuleConcatenationPlugin is in play
  useIndividualModuleName: boolean
}) {
  const { module, useIndividualModuleName } = args
  if (!useIndividualModuleName || !module.isSuperModule) {
    return module.rawFromWebpack.name
  }
  // All super-module entries have the original individual module inside their nested modules property AFAICT
  const subModuleOfSameName = module.rawFromWebpack.modules.find((subModule) => {
    return getModuleIdentifierKey(subModule.identifier) === getModuleIdentifier(module)
  })
  if (subModuleOfSameName) {
    return subModuleOfSameName.name
  } else {
    return module.rawFromWebpack.name
  }
}