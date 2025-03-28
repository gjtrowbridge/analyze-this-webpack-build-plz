import { StatsChunk, StatsModule, type StatsModuleReason } from 'webpack'
import { ChunkRow, ModuleRow } from '../../shared/types'
import { ImmutableArray } from '@hookstate/core'

/**
 * Including both the parent and child in this is maybe a bit more confusing than having a parent
 * one and a child one separately...
 * If reading processedModule.parentModules, use the `parentModuleDatabaseId` field,
 * if reading processedModule.childModules, use the `childModuleDatabaseId` field
 */
interface ModuleRelationshipInfo {
  // A value of null indicates that no parent was found for the identifier webpack gave us
  parentModuleDatabaseId: number | null
  childModuleDatabaseId: number
  isLazy?: boolean
  reasonType?: string
}

export interface ProcessedChunkInfo {
  chunkDatabaseId: number
  rawFromWebpack: StatsChunk

  parentChunkDatabaseIds: Set<number>
  siblingChunkDatabaseIds: Set<number>
  childChunkDatabaseIds: Set<number>

  childModuleDatabaseIds: Set<number>
  // originModuleDatabaseIds: Array<number>
}

export type ProcessedState = {
  modulesByDatabaseId: Map<number, ProcessedModuleInfo>
  chunksByDatabaseId: Map<number, ProcessedChunkInfo>
  moduleInclusionReasons: Set<string>
}

export interface ProcessedModuleInfo {
  moduleDatabaseId: number
  rawFromWebpack: StatsModule

  // -1 => not directly connected to the entry point file
  isEntry: boolean
  /**
   * The chain from the entry point module to this module (if any).
   * This will be null if the module is not connected to the webpack entry point at all.
   */
  pathFromEntry: Array<number> | null

  parentModules: Array<ModuleRelationshipInfo>
  childModules: Array<ModuleRelationshipInfo>

  parentChunkDatabaseIds: Array<number>
}

const moduleReasonTypeHandlers: {
  [reasonType: string]: (args: {
    modulesByWebpackIdentifier: Map<string, ProcessedModuleInfo>
    module: ProcessedModuleInfo,
    reason: StatsModuleReason,
  }) => void
} = {
  "entry": (args: {
    modulesByWebpackIdentifier: Map<string, ProcessedModuleInfo>
    module: ProcessedModuleInfo,
    reason: StatsModuleReason,
  }) => {
    const { module } = args
    module.isEntry = true
  },
  "harmony side effect evaluation": getImportHandler({ isLazy: false }),
  "harmony import specifier": getImportHandler({ isLazy: false }),

  "import() eager": getImportHandler({ isLazy: true }),
  "import()": getImportHandler({ isLazy: true }),

  "cjs require": getImportHandler({ isLazy: false }),
  "harmony export imported specifier": getImportHandler({ isLazy: false }),
  "cjs self exports reference": getImportHandler({ isLazy: false }),
  "cjs full require": getImportHandler({ isLazy: false }),
  "cjs export require": getImportHandler({ isLazy: false }),
  "module decorator": getImportHandler({ isLazy: false }),
  "unknown": getImportHandler({ isLazy: false }),
  "evaluated X in harmony import specifier": getImportHandler({ isLazy: false }),
  "new Worker()": getImportHandler({ isLazy: false }),
  "amd require": getImportHandler({ isLazy: false }),
  "new URL()": getImportHandler({ isLazy: false }),
  "loader import": getImportHandler({ isLazy: false }),
}

export function processModulesAndChunks(args: {
  moduleRows: ImmutableArray<ModuleRow>
  chunkRows: ImmutableArray<ChunkRow>
}): ProcessedState {
  const {
    moduleRows,
    chunkRows,
  } = args
  const chunksByDatabaseId = new Map<number, ProcessedChunkInfo>
  const modulesByDatabaseId = new Map<number, ProcessedModuleInfo>

  const chunksByWebpackId = new Map<string | number, ProcessedChunkInfo>()
  const modulesByWebpackIdentifier = new Map<string, ProcessedModuleInfo>()
  const moduleInclusionReasons = new Set<string>()

  /**
   * Initialize the lookups
   */
  chunkRows.forEach((chunkRow) => {
    // This will be updated with actual data later
    const processedChunk: ProcessedChunkInfo = {
      chunkDatabaseId: chunkRow.id,
      rawFromWebpack: JSON.parse(chunkRow.raw_json),
      parentChunkDatabaseIds: new Set<number>(),
      siblingChunkDatabaseIds: new Set<number>(),
      childChunkDatabaseIds: new Set<number>(),
      childModuleDatabaseIds: new Set<number>(),
    }
    chunksByDatabaseId.set(chunkRow.id, processedChunk)
    chunksByWebpackId.set(processedChunk.rawFromWebpack.id, processedChunk)
  })
  moduleRows.forEach((moduleRow) => {
    const processedModule: ProcessedModuleInfo = {
      isEntry: false,
      moduleDatabaseId: moduleRow.id,
      rawFromWebpack: JSON.parse(moduleRow.raw_json),
      pathFromEntry: [],
      parentModules: [],
      childModules: [],
      parentChunkDatabaseIds: [],
    }
    modulesByDatabaseId.set(moduleRow.id, processedModule)
    modulesByWebpackIdentifier.set(processedModule.rawFromWebpack.identifier, processedModule)
  })

  /**
   * Iterate over modules and populate child/parent/entry data as we go
   */
  for (const [_, module] of modulesByDatabaseId) {
    /**
     * Process parent chunk <-> module child information
     */
    for (const webpackChunkId of module.rawFromWebpack.chunks) {
      const chunk = chunksByWebpackId.get(webpackChunkId)
      if (chunk) {
        chunk.childModuleDatabaseIds.add(module.moduleDatabaseId)
        module.parentChunkDatabaseIds.push(chunk.chunkDatabaseId)
      }
    }

    /**
     * Process parent module <-> module child information
     */
    for (const reason of module.rawFromWebpack.reasons) {
      moduleInclusionReasons.add(reason.type)
      const handler = moduleReasonTypeHandlers[reason.type]
      if (!handler) {
        throw `We need to add a reason type handler for ${reason.type}`
      }
      handler({
        modulesByWebpackIdentifier,
        module,
        reason,
      })
    }
  }

  /**
   * Updates .pathToEntry for any modules connected to the entry point
   */
  bfsUpdatePathToEntry(modulesByDatabaseId)

  /**
   * Iterate over chunks and process parent/child stuff for chunks
   */
  for (const [_, chunk] of chunksByDatabaseId) {
    /**
     * Process parent chunk information
     */
    for (const webpackChunkId of chunk.rawFromWebpack.parents) {
      const parentChunk = chunksByWebpackId.get(webpackChunkId)
      if (parentChunk) {
        chunk.parentChunkDatabaseIds.add(parentChunk.chunkDatabaseId)
        parentChunk.childChunkDatabaseIds.add(chunk.chunkDatabaseId)
      }
    }
    /**
     * Process child chunk information
     * Seems like this should be duplicative of the parent chunk info, but
     * just in case webpack is doing weird things with stats.json, we'll handle both
     */
    for (const webpackChunkId of chunk.rawFromWebpack.children) {
      const childChunk = chunksByWebpackId.get(webpackChunkId)
      if (childChunk) {
        chunk.childChunkDatabaseIds.add(childChunk.chunkDatabaseId)
        childChunk.parentChunkDatabaseIds.add(chunk.chunkDatabaseId)
      }
    }

    /**
     * Process sibling chunk information
     */
    for (const webpackChunkId of chunk.rawFromWebpack.siblings) {
      const siblingChunk = chunksByWebpackId.get(webpackChunkId)
      if (siblingChunk) {
        chunk.siblingChunkDatabaseIds.add(siblingChunk.chunkDatabaseId)
        // The assumption here is that when webpack marks something as a sibling, it's mutual
        // That MAYBE is not true, not sure
        siblingChunk.siblingChunkDatabaseIds.add(chunk.chunkDatabaseId)
      }
    }
  }

  return {
    chunksByDatabaseId,
    modulesByDatabaseId,
    moduleInclusionReasons,
  }
}

function getImportHandler(outerArgs: { isLazy?: boolean }) {
  return (args: {
    modulesByWebpackIdentifier: Map<string, ProcessedModuleInfo>
    module: ProcessedModuleInfo,
    reason: StatsModuleReason,
  }) => {
    const {
      modulesByWebpackIdentifier,
      module: child,
      reason,
    } = args
    const parentWebpackIdentifier = reason.moduleIdentifier
    const parent = modulesByWebpackIdentifier.get(parentWebpackIdentifier)
    if (!parent) {
      console.log('xcxc could not find parent')
      return
    }

    const relationship: ModuleRelationshipInfo = {
      isLazy: Boolean(outerArgs.isLazy),
      reasonType: reason.type,
      childModuleDatabaseId: child.moduleDatabaseId,
      parentModuleDatabaseId: parent === undefined ? null : parent.moduleDatabaseId,
    }
    parent.childModules.push(relationship)
    child.parentModules.push(relationship)
  }
}

/**
 * Does a breadth-first search down the chain from the entry point to any connected modules
 */
function bfsUpdatePathToEntry(modulesByDatabaseId: Map<number, ProcessedModuleInfo>) {
  type QueueItem = {
    moduleDatabaseId: number,
    // The shortest path (if any) of module database ids leading up to the entry point
    path: Array<number>,
  }
  /**
   * Seed the queue with just the entry point modules to start
   */
  const entries: Array<ProcessedModuleInfo> = Array.from(modulesByDatabaseId.values()).filter((m) => {
    return m.isEntry
  })
  const queue: Array<QueueItem> = entries.map((m) => {
    return {
      moduleDatabaseId: m.moduleDatabaseId,
      // The path always starts with the entry point, so we can distinguish between these and paths
      // that never reach an entry point.
      path: [m.moduleDatabaseId],
    }
  })

  const alreadySeenModuleDatabaseIds = new Set<number>()
  function innerLoop(item: QueueItem) {
    const { moduleDatabaseId, path } = item
    if (alreadySeenModuleDatabaseIds.has(moduleDatabaseId)) {
      return
    }
    alreadySeenModuleDatabaseIds.add(moduleDatabaseId)

    const module = modulesByDatabaseId.get(moduleDatabaseId)
    module.pathFromEntry = path

    for (const childModule of module.childModules) {
      queue.push({
        moduleDatabaseId: childModule.childModuleDatabaseId,
        path: [...path, moduleDatabaseId],
      })
    }
  }
}