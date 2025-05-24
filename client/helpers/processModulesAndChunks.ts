import { StatsChunk, StatsModule, type StatsModuleReason, StatsChunkGroup, StatsAsset } from 'webpack'
import { AssetRow, ChunkRow, ModuleRow, NamedChunkGroupRow } from '../../shared/types'
import { ImmutableArray, ImmutableObject } from '@hookstate/core'
import { getSanitizedChunkId } from './chunks'
import { getModuleIdentifier, getModuleIdentifierKey } from './modules'
import { AssetLookup } from './assets'

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
  reasons: Array<{
    isLazy?: boolean
    reasonType: string
  }>
}

export interface ProcessedNamedChunkGroupInfo {
  namedChunkGroupDatabaseId: number
  name: string
  rawFromWebpack: ImmutableObject<StatsChunkGroup>
  chunkDatabaseIds: Set<number>
  totalSize: number
}

export interface ProcessedAssetInfo {
  assetDatabaseId: number,
  rawFromWebpack: ImmutableObject<StatsAsset>
  chunkDatabaseIds: Set<number>
  moduleDatabaseIds: Set<number>
  subModuleDatabaseIds: Set<number>
  namedChunkGroupDatabaseIds: Set<number>
}

export interface ProcessedChunkInfo {
  chunkDatabaseId: number
  rawFromWebpack: ImmutableObject<StatsChunk>

  parentChunkDatabaseIds: Set<number>
  siblingChunkDatabaseIds: Set<number>
  childChunkDatabaseIds: Set<number>
  namedChunkGroupDatabaseIds: Set<number>

  childModuleDatabaseIds: Set<number>
  // See #ConcatenatedModules
  childSubmoduleDatabaseIds: Set<number>
  pathFromEntry: Array<number>
  // originModuleDatabaseIds: Array<number>
}

export type ProcessedState = {
  status: 'NOT_LOADED' | 'LOADING' | 'LOADED'
  progress: {
    modules: number
    chunks: number
  }
  modulesByDatabaseId: Map<number, ProcessedModuleInfo>
  modulesByWebpackIdentifier: Map<string, ProcessedModuleInfo>
  chunksByDatabaseId: Map<number, ProcessedChunkInfo>
  chunksByWebpackId: Map<string, ProcessedChunkInfo>
  moduleInclusionReasons: Set<string>
  namedChunkGroupsByDatabaseId: Map<number, ProcessedNamedChunkGroupInfo>
  assetLookup: AssetLookup
}

export interface ProcessedModuleInfo {
  moduleDatabaseId: number
  rawFromWebpack: ImmutableObject<StatsModule>

  // -1 => not directly connected to the entry point file
  isEntry: boolean
  /**
   * The chain from the entry point module to this module (if any).
   * This will be null if the module is not connected to the webpack entry point at all.
   */
  pathFromEntry: Array<number>

  /**
   * moduleDatabaseId -> ModuleRelationshipInfo
   * This is a map because a module in stats.json can list multiple reasons originating from the same file
   */
  parentModules: Map<number, ModuleRelationshipInfo>
  childModules: Map<number, ModuleRelationshipInfo>

  parentChunkDatabaseIds: Set<number>
  namedChunkGroupDatabaseIds: Set<number>

  /**
   * #ConcatenatedModules
   * This will only be non-empty for modules that have been concatenated via ModuleConcatenationPlugin.
   * Basically, this means that this module has been concatenated with other modules, and so the stats.json
   * will show slightly different data for this module and its inner concatenated "sub-modules" (not the same as child
   * module, though there will be overlap between the 2).
   * - "Child Module" in this tool means "a module that was imported to the code as a result of code in the parent module"
   * - "Sub Module" in this tool means "a module that was concatenated inside of this module by webpack"
   * - "Super Module" in this tool means "a module that has submodules concatenated onto it by webpack"
   *
   * In cases where we have sub-modules, stats.json appears to show the following (non-exhaustive) list of differences:
   *  - The submodule will have a blank "chunks" field, even though the submodule will of course be in the same chunk as
   *    its supermodule.
   *    - (The submodule will be listed inside of supermodule.modules, but also as a top level module)
   *  - The supermodule will have an accurate, filled-in chunks field.
   *  - The supermodule will have a "size" field that reflects the total of all its submodules, rather than just the size
   *    of the original individual module. (eg. so if module 1 has modules 2 and 3 concatenated onto it, and the sizes of
   *    each of those modules individually is 100, 110, 120, respectively, then module 1 in stats.json will show "330" as its
   *    size, which is the total of itself AND its concatenated submodules
   *  - The first item in supermodule.modules will be the original supermodule (so, if module 1 has modules 2 and 3 concatenated
   *    onto it, module1.modules in stats.json will have length 3, [module1, module2, module3]
   *
   * When enabled, sub-module handling in this tool will make it so the submodules get the extra data they're missing, and are
   * searchable, etc exactly the same way as any other top-level module
   */
  innerConcatenatedModuleDatabaseIds: Set<number>
  parentChunkDatabaseIdsFromSuperModule: Set<number>
  isSuperModule: boolean
  isSubModule: boolean
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
  "import() context lazy": getImportHandler({ isLazy: true }),

  "import() context element": getImportHandler({ isLazy: false }),
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

export function processState(args: {
  moduleRows: ImmutableArray<ModuleRow>
  chunkRows: ImmutableArray<ChunkRow>
  namedChunkGroupRows: ImmutableArray<NamedChunkGroupRow>
  assetRows: ImmutableArray<AssetRow>
}): ProcessedState {
  const {
    moduleRows,
    chunkRows,
    namedChunkGroupRows,
    assetRows,
  } = args
  const chunksByDatabaseId = new Map<number, ProcessedChunkInfo>
  const modulesByDatabaseId = new Map<number, ProcessedModuleInfo>
  const namedChunkGroupsByDatabaseId = new Map<number, ProcessedNamedChunkGroupInfo>
  const assetLookup = new AssetLookup()

  const chunksByWebpackId = new Map<string, ProcessedChunkInfo>()
  const modulesByWebpackIdentifier = new Map<string, ProcessedModuleInfo>()
  const moduleInclusionReasons = new Set<string>()

  /**
   * Do initial processing for chunks
   */
  chunkRows.forEach((chunkRow) => {
    // This will be updated with actual data later
    const processedChunk: ProcessedChunkInfo = {
      chunkDatabaseId: chunkRow.databaseId,
      rawFromWebpack: chunkRow.rawFromWebpack,
      parentChunkDatabaseIds: new Set<number>(),
      siblingChunkDatabaseIds: new Set<number>(),
      childChunkDatabaseIds: new Set<number>(),
      childModuleDatabaseIds: new Set<number>(),
      childSubmoduleDatabaseIds: new Set<number>(),
      namedChunkGroupDatabaseIds: new Set<number>(),
      pathFromEntry: [],
    }
    chunksByDatabaseId.set(chunkRow.databaseId, processedChunk)
    chunksByWebpackId.set(getSanitizedChunkId(processedChunk.rawFromWebpack.id), processedChunk)
  })

  /**
   * Do initial processing for modules
   */
  moduleRows.forEach((moduleRow) => {
    const processedModule: ProcessedModuleInfo = {
      isEntry: false,
      moduleDatabaseId: moduleRow.databaseId,
      rawFromWebpack: moduleRow.rawFromWebpack,
      pathFromEntry: [],
      parentModules: new Map<number, ModuleRelationshipInfo>,
      childModules: new Map<number, ModuleRelationshipInfo>,
      parentChunkDatabaseIds: new Set<number>,
      namedChunkGroupDatabaseIds: new Set<number>,
      /**
       * These get updated in the next step
       */
      innerConcatenatedModuleDatabaseIds: new Set<number>,
      parentChunkDatabaseIdsFromSuperModule: new Set<number>,
      isSuperModule: false,
      isSubModule: false,
    }
    modulesByDatabaseId.set(moduleRow.databaseId, processedModule)
    const moduleIdentifier = getModuleIdentifier(processedModule)
    modulesByWebpackIdentifier.set(moduleIdentifier, processedModule)
  })

  /**
   * Do initial processing for named chunk groups
   */
  namedChunkGroupRows.forEach((namedChunkGroupRow) => {
    const processedNamedChunkGroup: ProcessedNamedChunkGroupInfo = {
      rawFromWebpack: namedChunkGroupRow.rawFromWebpack,
      namedChunkGroupDatabaseId: namedChunkGroupRow.databaseId,
      chunkDatabaseIds: new Set<number>,
      name: namedChunkGroupRow.rawFromWebpack.name,
      totalSize: 0,
    }
    // Update the database ids for chunks and named chunk groups
    namedChunkGroupRow.rawFromWebpack.chunks.forEach((c) => {
      const chunkWebpackId = getSanitizedChunkId(c)
      if (chunksByWebpackId.has(chunkWebpackId)) {
        const chunk = chunksByWebpackId.get(chunkWebpackId)
        chunk.namedChunkGroupDatabaseIds.add(processedNamedChunkGroup.namedChunkGroupDatabaseId)
        processedNamedChunkGroup.chunkDatabaseIds.add(chunk.chunkDatabaseId)
        processedNamedChunkGroup.totalSize += chunk.rawFromWebpack.size
      }
    })
    namedChunkGroupsByDatabaseId.set(processedNamedChunkGroup.namedChunkGroupDatabaseId, processedNamedChunkGroup)
  })

  /**
   * Iterate over modules and populate child/parent/entry data as we go
   */
  for (const [_, module] of modulesByDatabaseId) {
    /**
     * Process parent chunk <-> module child information
     */
    for (const webpackChunkId of module.rawFromWebpack.chunks) {
      const chunk = chunksByWebpackId.get(getSanitizedChunkId(webpackChunkId))
      if (chunk) {
        chunk.childModuleDatabaseIds.add(module.moduleDatabaseId)
        module.parentChunkDatabaseIds.add(chunk.chunkDatabaseId)
        // Add named chunk group database IDs from the chunk to the module
        chunk.namedChunkGroupDatabaseIds.forEach(ncgId => {
          module.namedChunkGroupDatabaseIds.add(ncgId)
        })
      }
    }

    /**
     * Process parent module <-> child module information
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
  bfsUpdatePathToEntryModules(modulesByDatabaseId)

  /**
   * Iterate over chunks and process parent/child stuff for chunks
   */
  for (const [_, chunk] of chunksByDatabaseId) {
    /**
     * Process parent chunk information
     */
    for (const webpackChunkId of chunk.rawFromWebpack.parents) {
      const parentChunk = chunksByWebpackId.get(getSanitizedChunkId(webpackChunkId))
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
      const childChunk = chunksByWebpackId.get(getSanitizedChunkId(webpackChunkId))
      if (childChunk) {
        chunk.childChunkDatabaseIds.add(childChunk.chunkDatabaseId)
        childChunk.parentChunkDatabaseIds.add(chunk.chunkDatabaseId)
      }
    }

    /**
     * Process sibling chunk information
     */
    for (const webpackChunkId of chunk.rawFromWebpack.siblings) {
      const siblingChunk = chunksByWebpackId.get(getSanitizedChunkId(webpackChunkId))
      if (siblingChunk) {
        chunk.siblingChunkDatabaseIds.add(siblingChunk.chunkDatabaseId)
        // The assumption here is that when webpack marks something as a sibling, it's mutual
        // That MAYBE is not true, not sure
        siblingChunk.siblingChunkDatabaseIds.add(chunk.chunkDatabaseId)
      }
    }
  }

  /**
   * Updates .pathToEntry for any chunks connected to the chunk entry point(s)
   */
  bfsUpdatePathToEntryChunks(chunksByDatabaseId)

  /**
   * Optionally account for modules that have been [concatenated](https://webpack.js.org/plugins/module-concatenation-plugin/)
   * Basically, this will pull apart the stats.json such that even modules concatenated within other modules are
   * attributable to their eventual chunk, and total sizes shown in the tool reflect just the size of that module.
   *
   * See #ConcatenatedModules for more deets
   */
  for (const module of modulesByDatabaseId.values()) {
    const superModuleWebpackId = getModuleIdentifier(module)
    const subModules = module.rawFromWebpack.modules ?? []

    if (subModules.length > 0) {
      module.isSuperModule = true
    }

    // If subModules is non-empty, module is a "super module" with concatenated submodules
    subModules.forEach((subModule) => {
      const subModuleWebpackId = getModuleIdentifierKey(subModule.identifier)
      const subModuleTopLevelListing = modulesByWebpackIdentifier.get(subModuleWebpackId)
      if (!subModuleTopLevelListing) {
        throw `could not find sub module in top level!! ${subModuleWebpackId}`
      }

      /**
       * Every super-module lists itself as the first concatenated module. The submodule listing is a bit different,
       * though, since it includes the size of just that module.
       *
       * For this part, we don't want to list the module as its own submodule.
       */
      if (superModuleWebpackId !== subModuleWebpackId) {
        subModuleTopLevelListing.isSubModule = true

        // Make it so the supermodule has a pointer to the top-level list of its submodules
        module.innerConcatenatedModuleDatabaseIds.add(subModuleTopLevelListing.moduleDatabaseId)

        // By default, stats.json won't associate submodules with their chunks. This helps us keep track of which
        // submodules live in which chunks (because the supermodule is in the chunk).
        // I know these comments aren't the MOST clear, maybe I'll go back and reword this sometime in future to make
        // this more understandable.
        module.parentChunkDatabaseIds.forEach((parentChunkDatabaseId) => {
          subModuleTopLevelListing.parentChunkDatabaseIdsFromSuperModule.add(parentChunkDatabaseId)

          const chunk = chunksByDatabaseId.get(parentChunkDatabaseId)
          chunk.childSubmoduleDatabaseIds.add(subModuleTopLevelListing.moduleDatabaseId)
        })
      }
    })
  }

  /**
   * Process the assets info
   */
  assetRows.forEach((assetRow) => {
    const chunksFromWebpack = assetRow.rawFromWebpack.chunks ?? []

    const chunkDatabaseIds = new Set<number>()
    const moduleDatabaseIds = new Set<number>()
    const subModuleDatabaseIds = new Set<number>()
    const namedChunkGroupDatabaseIds = new Set<number>()

    chunksFromWebpack.forEach((chunkWebpackId: number) => {
      const chunk = chunksByWebpackId.get(getSanitizedChunkId(chunkWebpackId))
      if (!chunk) {
        return undefined
      }

      chunkDatabaseIds.add(chunk.chunkDatabaseId)

      chunk.childModuleDatabaseIds.forEach((moduleDatabaseId) => {
        moduleDatabaseIds.add(moduleDatabaseId)
      })
      chunk.childSubmoduleDatabaseIds.forEach((subModuleDatabaseId) => {
        subModuleDatabaseIds.add(subModuleDatabaseId)
      })
      // Add named chunk group database IDs from the chunk to the asset
      chunk.namedChunkGroupDatabaseIds.forEach((ncgId) => {
        namedChunkGroupDatabaseIds.add(ncgId)
      })
    })

    const processedAsset: ProcessedAssetInfo = {
      assetDatabaseId: assetRow.databaseId,
      rawFromWebpack: assetRow.rawFromWebpack,
      chunkDatabaseIds: new Set(chunkDatabaseIds),
      moduleDatabaseIds,
      subModuleDatabaseIds,
      namedChunkGroupDatabaseIds,
    }
    assetLookup.addAsset(processedAsset)
  })

  return {
    status: 'LOADED',
    progress: {
      modules: 100,
      chunks: 100,
    },
    chunksByDatabaseId,
    chunksByWebpackId,
    modulesByDatabaseId,
    modulesByWebpackIdentifier,
    moduleInclusionReasons,
    namedChunkGroupsByDatabaseId,
    assetLookup,
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
    const parentWebpackIdentifier = getModuleIdentifierKey(reason.moduleIdentifier)
    const parent = modulesByWebpackIdentifier.get(parentWebpackIdentifier)
    if (!parent) {
      console.log('xcxc could not find parent', parentWebpackIdentifier)
      return
    }
    const relationship: ModuleRelationshipInfo = parent.childModules.get(child.moduleDatabaseId) || {
      childModuleDatabaseId: child.moduleDatabaseId,
      parentModuleDatabaseId: parent.moduleDatabaseId,
      reasons: [],
    }
    relationship.reasons.push({
      isLazy: Boolean(outerArgs.isLazy),
      reasonType: reason.type,
    })

    parent.childModules.set(child.moduleDatabaseId, relationship)
    child.parentModules.set(parent.moduleDatabaseId, relationship)
  }
}

/**
 * Does a breadth-first search down the chain from the entry point to any connected modules
 */
function bfsUpdatePathToEntryModules(modulesByDatabaseId: Map<number, ProcessedModuleInfo>) {
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

  /**
   * Make sure we don't process the same node more than once
   */
  const alreadySeenModuleDatabaseIds = new Set<number>(queue.map((i) => {
    return i.moduleDatabaseId
  }))
  let processedSoFar = 0

  /**
   * Loop over the queue until everything has been processed
   */
  while (queue.length > 0) {
    processedSoFar += 1

    // Grab the next item
    const item = queue.shift()
    const { moduleDatabaseId, path } = item

    const module = modulesByDatabaseId.get(moduleDatabaseId)
    module.pathFromEntry = path
    for (const childModule of Array.from(module.childModules.values())) {
      const childDatabaseId = childModule.childModuleDatabaseId
      if (!alreadySeenModuleDatabaseIds.has(childDatabaseId)) {
        alreadySeenModuleDatabaseIds.add(childDatabaseId)
        queue.push({
          moduleDatabaseId: childDatabaseId,
          path: [...path, childDatabaseId],
        })
      }
    }
  }
}

function bfsUpdatePathToEntryChunks(chunksByDatabaseId: Map<number, ProcessedChunkInfo>) {
  type QueueItem = {
    chunkDatabaseId: number,
    path: Array<number>,
  }
  const queue: Array<QueueItem> = []
  const alreadySeenChunkDatabaseIds = new Set<number>() 
  for (const [_, chunk] of chunksByDatabaseId) {
    if (chunk.rawFromWebpack.entry) {
      queue.push({
        chunkDatabaseId: chunk.chunkDatabaseId,
        path: [chunk.chunkDatabaseId],
      })
    }
  }
  while (queue.length > 0) {
    const item = queue.shift()
    const { chunkDatabaseId, path } = item
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    chunk.pathFromEntry = path
    for (const childChunk of Array.from(chunk.childChunkDatabaseIds)) {
      if (!alreadySeenChunkDatabaseIds.has(childChunk)) {
        alreadySeenChunkDatabaseIds.add(childChunk)
        queue.push({
          chunkDatabaseId: childChunk,
          path: [...path, childChunk],
        })
      }
    }
  }
}
