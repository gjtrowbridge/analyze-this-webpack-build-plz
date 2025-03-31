import { ProcessedModuleInfo } from './processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { getModuleIdentifierKey } from './modules'

function moduleHasChanged(args: {
  m1: ImmutableObject<ProcessedModuleInfo>
  m2: ImmutableObject<ProcessedModuleInfo>
}): boolean {
  const { m1, m2 } = args
  return m1.rawFromWebpack.size !== m2.rawFromWebpack.size
}

export function compareFiles(args: {
  file1ModulesByWebpackId: ImmutableMap<string, ProcessedModuleInfo>
  file2ModulesByWebpackId: ImmutableMap<string, ProcessedModuleInfo>
}): {
  modules: {
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
} {
  const {
    file1ModulesByWebpackId,
    file2ModulesByWebpackId,
  } = args

  const changed: Array<{
    file1Module: ImmutableObject<ProcessedModuleInfo>,
    file2Module: ImmutableObject<ProcessedModuleInfo>,
  }> = []
  const onlyInFile1: Array<ImmutableObject<ProcessedModuleInfo>> = []
  const onlyInFile2: Array<ImmutableObject<ProcessedModuleInfo>> = []

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
        changed.push({
          file1Module,
          file2Module,
        })
      }
    } else {
      onlyInFile1.push(file1Module)
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
      onlyInFile2.push(file2Module)
    }
  }

  return {
    modules: {
      changed,
      onlyInFile1,
      onlyInFile2,
    }
  }

}
