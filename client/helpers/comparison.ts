import { ProcessedChunkInfo, ProcessedModuleInfo } from './processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { getModuleIdentifierKey } from './modules'

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

export function compareFiles(args: {
  file1ModulesByWebpackId: ImmutableMap<string, ProcessedModuleInfo>
  file2ModulesByWebpackId: ImmutableMap<string, ProcessedModuleInfo>
  file1ChunksByWebpackId: ImmutableMap<string, ProcessedChunkInfo>
  file2ChunksByWebpackId: ImmutableMap<string, ProcessedChunkInfo>
}): {
  modules: ModuleComparisonData
  chunks: ChunkComparisonData
} {
  const {
    file1ModulesByWebpackId,
    file2ModulesByWebpackId,
    file1ChunksByWebpackId,
    file2ChunksByWebpackId,
  } = args

  const modulesChanged: Array<{
    file1Module: ImmutableObject<ProcessedModuleInfo>,
    file2Module: ImmutableObject<ProcessedModuleInfo>,
  }> = []
  const modulesOnlyInFile1: Array<ImmutableObject<ProcessedModuleInfo>> = []
  const modulesOnlyInFile2: Array<ImmutableObject<ProcessedModuleInfo>> = []

  const nullWebpackId = getModuleIdentifierKey(null)

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
      }
    } else {
      modulesOnlyInFile1.push(file1Module)
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
      }
    } else {
      chunksOnlyInFile1.push(file1Chunk)
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
    }
  }

  return {
    modules: {
      changed: modulesChanged,
      onlyInFile1: modulesOnlyInFile1,
      onlyInFile2: modulesOnlyInFile2,
    },
    chunks: {
      changed: chunksChanged,
      onlyInFile1: chunksOnlyInFile1,
      onlyInFile2: chunksOnlyInFile2,
    }
  }
}
