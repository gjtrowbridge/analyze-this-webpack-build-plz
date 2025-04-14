import { ProcessedModuleInfo } from './processModulesAndChunks'
import { ImmutableObject } from '@hookstate/core'

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

export function getModuleSize(m: ImmutableObject<ProcessedModuleInfo>): number {
  return m.rawFromWebpack.size
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
export function getModuleExtraSizeDueToDuplication(m: ImmutableObject<ProcessedModuleInfo>): number {
  const numChunks = getModuleNumberOfChunks(m)
  const size = getModuleSize(m)
  return size * (numChunks - 1)
}