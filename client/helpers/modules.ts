import type {StatsModule, StatsModuleReason} from "webpack"

export type ModuleIdentifier = string
export interface ModuleExtraInfo {
  parents: Map<ModuleIdentifier, RelationshipInfo>,
  children: Map<ModuleIdentifier, RelationshipInfo>,
  isEntry: boolean,
  depth: number,
}
export const noDepthFoundConstant = 100000

interface RelationshipInfo {
  isLazy?: boolean
  reasonType?: string
}

function getImportHandler(outerArgs: { isLazy?: boolean }) {
  return (args: {
    modulesById: Map<ModuleIdentifier, StatsModule>
    extraInfoById: Map<ModuleIdentifier, ModuleExtraInfo>
    module: StatsModule,
    reason: StatsModuleReason,
  }) => {
    const {
      extraInfoById,
      module,
      reason,
    } = args
    const parentId = reason.moduleIdentifier
    const childId = module.identifier
    const relationship: RelationshipInfo = {
      isLazy: Boolean(outerArgs.isLazy),
      reasonType: reason.type,
    }
    const parent = extraInfoById.get(parentId)
    const child = extraInfoById.get(childId)
    if (child) {
      child.parents.set(parentId, relationship)
    }
    if (parent) {
      parent.children.set(childId, relationship)
    }
  }
}

/*
Counts:
{
  "entry": 1,
  "harmony side effect evaluation": 185133,
  "harmony import specifier": 458392,
  "import() eager": 173,
  "import()": 1781,
  "cjs require": 2866,
  "harmony export imported specifier": 6206,
  "cjs self exports reference": 2007,
  "cjs full require": 73,
  "cjs export require": 36,
  "module decorator": 33,
  "unknown": 121,
  "evaluated X in harmony import specifier": 15,
  "new Worker()": 6,
  "amd require": 6,
  "new URL()": 3,
  "loader import": 121,
}
 */
const moduleReasonTypeHandlers: {
  [reasonType: string]: (args: {
    modulesById: Map<ModuleIdentifier, StatsModule>
    extraInfoById: Map<ModuleIdentifier, ModuleExtraInfo>
    module: StatsModule,
    reason: StatsModuleReason,
  }) => void
} = {
  "entry": (args: {
    modulesById: Map<ModuleIdentifier, StatsModule>
    extraInfoById: Map<ModuleIdentifier, ModuleExtraInfo>
    module: StatsModule,
    reason: StatsModuleReason,
  }) => {
    const { extraInfoById, module } = args
    const e = extraInfoById.get(module.identifier)
    e.isEntry = true
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

function bfsUpdateModules(args: {
  entries: Array<StatsModule>,
  modulesById: Map<ModuleIdentifier, StatsModule>,
  extraInfoById: Map<ModuleIdentifier, ModuleExtraInfo>,
}) {
  const { entries, modulesById, extraInfoById } = args
  type QueueEntry = {
    moduleId: ModuleIdentifier,
    depth: number,
    sizeSoFar: number,
  }
  const queue: Array<QueueEntry> = entries.map((m) => {
    return {
      moduleId: m.identifier,
      depth: 0,
      sizeSoFar: 0,
    }
  })
  const alreadySeen = new Set<ModuleIdentifier>()
  function innerLoop(entry: QueueEntry) {
    const { moduleId, depth, sizeSoFar } = entry
    if (alreadySeen.has(moduleId)) {
      return
    }
    alreadySeen.add(moduleId)

    const module = modulesById.get(moduleId)
    const extraInfo = extraInfoById.get(moduleId)
    const sizeWithDescendants = module.size + sizeSoFar
    extraInfo.depth = depth

    for (const [childId] of extraInfo.children) {
      queue.push({
        moduleId: childId,
        depth: depth + 1,
        sizeSoFar: sizeWithDescendants,
      })
    }
  }

  while (queue.length > 0) {
    innerLoop(queue.shift())
  }
}

export function processModules(modules: Array<StatsModule>) {
  const modulesById = new Map<ModuleIdentifier, StatsModule>()
  const extraInfoById: Map<ModuleIdentifier, ModuleExtraInfo> = new Map<ModuleIdentifier, {
    parents: Map<ModuleIdentifier, RelationshipInfo>,
    children: Map<ModuleIdentifier, RelationshipInfo>,
    isEntry: boolean,
    depth: number,
  }>
  const inclusionReasons = new Set<string>()

  // Set up the lookup
  for (const module of modules) {
    if (module.identifier === undefined) {
      continue
    }
    modulesById.set(module.identifier, module)
    extraInfoById.set(module.identifier, {
      parents: new Map<ModuleIdentifier, RelationshipInfo>(),
      children: new Map<ModuleIdentifier, RelationshipInfo>(),
      isEntry: false,
      depth: noDepthFoundConstant,
    })
  }

  // Update the parentage
  for (const [_, module] of modulesById) {
    for (const reason of module.reasons) {
      inclusionReasons.add(reason.type)
      const handler = moduleReasonTypeHandlers[reason.type]
      if (handler) {
        handler({
          modulesById,
          extraInfoById,
          module,
          reason,
        })
      }
    }
  }

  // Update other stuff like depth, sizeWithDescendants
  bfsUpdateModules({
    entries: Array.from(modulesById.values()).filter((m) => {
      const e = extraInfoById.get(m.identifier)
      return e.isEntry
    }),
    modulesById,
    extraInfoById,
  })

  return {
    inclusionReasons,
    extraInfoById,
    modulesById,
  }
}