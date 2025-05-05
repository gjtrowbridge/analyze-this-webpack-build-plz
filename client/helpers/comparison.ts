import { ProcessedAssetInfo, ProcessedChunkInfo, ProcessedModuleInfo } from './processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { getModuleIdentifier } from './modules'
import { assetHasChanged, getAssetName } from './assets'

function moduleHasChanged(args: {
  m1: ImmutableObject<ProcessedModuleInfo>
  m2: ImmutableObject<ProcessedModuleInfo>
}): boolean {
  const { m1, m2 } = args
  return m1.rawFromWebpack.size !== m2.rawFromWebpack.size
}

function chunkHasChanged(args: {
  c1: ImmutableObject<ProcessedChunkInfo>
  c2: ImmutableObject<ProcessedChunkInfo>
}): boolean {
  const { c1, c2 } = args
  return c1.rawFromWebpack.size !== c2.rawFromWebpack.size
}

export type ModuleComparisonData = {
  /**
   * Stores the database ids of two equivalent modules from different files
   */
  changed: Array<{
    file1Module: ImmutableObject<ProcessedModuleInfo>,
    file2Module: ImmutableObject<ProcessedModuleInfo>,
  }>,
  /**
   * Database ids (can use these because they're only in the one file
   */
  onlyInFile1: Array<ImmutableObject<ProcessedModuleInfo>>,
  onlyInFile2: Array<ImmutableObject<ProcessedModuleInfo>>,
  relevant: Set<string>,
}

export type ChunkComparisonData = {
  /**
   * Stores the database ids of two equivalent modules from different files
   */
  changed: Array<{
    file1Chunk: ImmutableObject<ProcessedChunkInfo>,
    file2Chunk: ImmutableObject<ProcessedChunkInfo>,
  }>,
  /**
   * Database ids (can use these because they're only in the one file
   */
  onlyInFile1: Array<ImmutableObject<ProcessedChunkInfo>>,
  onlyInFile2: Array<ImmutableObject<ProcessedChunkInfo>>,
}

export type AssetComparisonData = {
  changed: Array<{
    file1Asset: ImmutableObject<ProcessedAssetInfo>,
    file2Asset: ImmutableObject<ProcessedAssetInfo>,
  }>,
  onlyInFile1: Array<ImmutableObject<ProcessedAssetInfo>>,
  onlyInFile2: Array<ImmutableObject<ProcessedAssetInfo>>
}

export function compareFiles(args: {
  file1ModulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  file2ModulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  file1ModulesByWebpackId: ImmutableMap<string, ProcessedModuleInfo>
  file2ModulesByWebpackId: ImmutableMap<string, ProcessedModuleInfo>
  file1ChunksByWebpackId: ImmutableMap<string, ProcessedChunkInfo>
  file2ChunksByWebpackId: ImmutableMap<string, ProcessedChunkInfo>
  file1AssetsByDatabaseId: ImmutableMap<number, ProcessedAssetInfo>
  file2AssetsByDatabaseId: ImmutableMap<number, ProcessedAssetInfo>
}): {
  modules: ModuleComparisonData
  chunks: ChunkComparisonData
  assets: AssetComparisonData
} {
  const {
    file1ModulesByDatabaseId,
    file2ModulesByDatabaseId,
    file1ModulesByWebpackId,
    file2ModulesByWebpackId,
    file1ChunksByWebpackId,
    file2ChunksByWebpackId,
    file1AssetsByDatabaseId,
    file2AssetsByDatabaseId,
  } = args

  const rando = Math.random()
  console.log('xcxc comparing', rando)

  const modulesChanged: Array<{
    file1Module: ImmutableObject<ProcessedModuleInfo>,
    file2Module: ImmutableObject<ProcessedModuleInfo>,
  }> = []
  const modulesOnlyInFile1: Array<ImmutableObject<ProcessedModuleInfo>> = []
  const modulesOnlyInFile2: Array<ImmutableObject<ProcessedModuleInfo>> = []
  const relevantModules = new Set<string>()
  const nullWebpackId = getModuleIdentifier(null)

  /**
   * Get modules that exist in both files but have changed from one to the other.
   * Also store modules that only exist in file 1.
   */
  for (const [file1Id, file1Module] of file1ModulesByWebpackId) {
    /**
     * Lots of modules have null webpack ids -- we won't bother comparing these...
     */
    if (file1Id === nullWebpackId) {
      continue
    }
    /**
     * We do the lookup by webpack id, since that's how we compare apples to apples across different stats files
     */
    const file2Module = file2ModulesByWebpackId.get(file1Id)
    if (file2Module) {
      const hasChanged = moduleHasChanged({ m1: file1Module, m2: file2Module })
      /**
       * But we store the module database id so it's easier to set up navigation / etc in the UI
       */
      if (hasChanged) {
        modulesChanged.push({
          file1Module,
          file2Module,
        })
        relevantModules.add(getModuleIdentifier(file1Module))
        relevantModules.add(getModuleIdentifier(file2Module))
      }
    } else {
      modulesOnlyInFile1.push(file1Module)
      relevantModules.add(getModuleIdentifier(file1Module))
    }
  }

  /**
   * Get modules that only exist in file 2
   */
  for (const [file2Id, file2Module] of file2ModulesByWebpackId) {
    /**
     * Lots of modules have null webpack ids -- we won't bother comparing these...
     */
    if (file2Id === nullWebpackId) {
      continue
    }
    const existsInFile1 = file1ModulesByWebpackId.has(file2Id)
    if (!existsInFile1) {
      modulesOnlyInFile2.push(file2Module)
    }
  }

  const chunksChanged: Array<{
    file1Chunk: ImmutableObject<ProcessedChunkInfo>,
    file2Chunk: ImmutableObject<ProcessedChunkInfo>,
  }> = []
  const chunksOnlyInFile1: Array<ImmutableObject<ProcessedChunkInfo>> = []
  const chunksOnlyInFile2: Array<ImmutableObject<ProcessedChunkInfo>> = []

  /**
   * Get chunks that exist in both files but have changed from one to the other.
   * Also store chunks that only exist in file 1.
   */
  for (const [file1Id, file1Chunk] of file1ChunksByWebpackId) {
    /**
     * Lots of chunks have null webpack ids -- we won't bother comparing these...
     */
    if (file1Id === nullWebpackId) {
      continue
    }
    /**
     * We do the lookup by webpack id, since that's how we compare apples to apples across different stats files
     */
    const file2Chunk = file2ChunksByWebpackId.get(file1Id)
    if (file2Chunk) {
      const hasChanged = chunkHasChanged({ c1: file1Chunk, c2: file2Chunk })
      /**
       * But we store the chunk database id so it's easier to set up navigation / etc in the UI
       */
      if (hasChanged) {
        chunksChanged.push({
          file1Chunk,
          file2Chunk,
        })
        addChunkModulesToRelevantSet({ chunk: file1Chunk, modulesByDatabaseId: file1ModulesByDatabaseId, relevantModules })
        addChunkModulesToRelevantSet({ chunk: file2Chunk, relevantModules, modulesByDatabaseId: file2ModulesByDatabaseId })
      }
    } else {
      chunksOnlyInFile1.push(file1Chunk)
      addChunkModulesToRelevantSet({ chunk: file1Chunk, relevantModules, modulesByDatabaseId: file1ModulesByDatabaseId })
    }
  }

  /**
   * Get chunks that only exist in file 2
   */
  for (const [file2Id, file2Chunk] of file2ChunksByWebpackId) {
    /**
     * Lots of chunks have null webpack ids -- we won't bother comparing these...
     */
    if (file2Id === nullWebpackId) {
      continue
    }
    const existsInFile1 = file1ChunksByWebpackId.has(file2Id)
    if (!existsInFile1) {
      chunksOnlyInFile2.push(file2Chunk)
      addChunkModulesToRelevantSet({ chunk: file2Chunk, relevantModules, modulesByDatabaseId: file2ModulesByDatabaseId })
    }
  }

  const assetsChanged: Array<{
    file1Asset: ImmutableObject<ProcessedAssetInfo>,
    file2Asset: ImmutableObject<ProcessedAssetInfo>,
  }> = []
  const assetsOnlyInFile1: Array<ImmutableObject<ProcessedAssetInfo>> = []
  const assetsOnlyInFile2: Array<ImmutableObject<ProcessedAssetInfo>> = []
  const assetsByNameFile1 = new Map<string, ImmutableObject<ProcessedAssetInfo>>()
  const assetsByNameFile2 = new Map<string, ImmutableObject<ProcessedAssetInfo>>()

  // file1AssetsByDatabaseId.forEach((file1Asset) => {
  //   const name = getAssetName(file1Asset)
  //   if (assetsByNameFile1.has(name)) {
  //     console.log(`new one ${rando}, ${name}`, file1Asset)
  //     console.log(`existing one ${rando}, ${name}`, assetsByNameFile1.get(name))
  //     throw `Woops! There are two assets with the same name! Handle this case now that we know it can happen! ${rando}`
  //   }
  //   assetsByNameFile1.set(name, file1Asset)
  // })
  //
  // file2AssetsByDatabaseId.forEach((file2Asset) => {
  //   const name = getAssetName(file2Asset)
  //   assetsByNameFile2.set(name, file2Asset)
  //
  //   const file1Asset = assetsByNameFile1.get(name)
  //   if (file1Asset === undefined) {
  //     assetsOnlyInFile2.push(file2Asset)
  //   } else {
  //     if (assetHasChanged({
  //       asset1: file1Asset,
  //       asset2: file2Asset,
  //     })) {
  //       assetsChanged.push({
  //         file1Asset,
  //         file2Asset,
  //       })
  //     }
  //   }
  // })
  //
  // assetsByNameFile1.forEach((file1Asset, name) => {
  //   if (!assetsByNameFile2.has(name)) {
  //     assetsOnlyInFile1.push(file1Asset)
  //   }
  // })

  return {
    modules: {
      changed: modulesChanged,
      onlyInFile1: modulesOnlyInFile1,
      onlyInFile2: modulesOnlyInFile2,
      relevant: relevantModules,
    },
    chunks: {
      changed: chunksChanged,
      onlyInFile1: chunksOnlyInFile1,
      onlyInFile2: chunksOnlyInFile2,
    },
    assets: {
      changed: assetsChanged,
      onlyInFile1: assetsOnlyInFile1,
      onlyInFile2: assetsOnlyInFile2,
    }
  }
}

function addChunkModulesToRelevantSet(args: {
  chunk: ImmutableObject<ProcessedChunkInfo>,
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>,
  relevantModules: Set<string>,
}) {
  const { chunk, modulesByDatabaseId, relevantModules } = args
  for (const moduleDatabaseId of chunk.childModuleDatabaseIds) {
    const module = modulesByDatabaseId.get(moduleDatabaseId)
    if (module) {
      relevantModules.add(getModuleIdentifier(module))
    }
  }
  for (const moduleDatabaseId of chunk.childSubmoduleDatabaseIds) {
    const module = modulesByDatabaseId.get(moduleDatabaseId)
    if (module) {
      relevantModules.add(getModuleIdentifier(module))
    }
  }
}
