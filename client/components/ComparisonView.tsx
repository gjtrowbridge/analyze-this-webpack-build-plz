// import { ChunksById, ModulesById, ReactChunkState, ReactModuleState } from '../types'
// import { ComparisonData, getComparisonData } from '../helpers/comparison'
// import { StatsChunk, StatsModule } from 'webpack'
// import { ChunkRow } from './ChunkRow'
// import { useState } from 'react'
// import { ModuleRow } from './ModuleRow'
// import { useFileNames } from '../hooks/useFiles'
//

import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState, file2ProcessedGlobalState, filesState } from '../globalState'
import { compareFiles } from '../helpers/comparison'
import { ModuleLink } from './ModuleLink'

export function ComparisonView() {
  return (
    <div id="ComparisonView">
      <h1>Modules that have changed</h1>
      <ModuleComparison />
    </div>
  )
}

function ModuleComparison() {
  const fileData = useHookstate(filesState)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)

  const file1OrNull = file1ProcessedState.ornull
  const file2OrNull = file2ProcessedState.ornull

  const loadedFileData = fileData.get()
  if (loadedFileData.status === "LOADED" && loadedFileData.selectedFileId2 === undefined) {
    return <div id="ModuleComparison" className={"error"}><p>Please select a comparison file first!</p></div>
  }

  if (file1OrNull === null || file2OrNull === null) {
    return <div id="ModuleComparison"><p>Loading and processing files, will show comparison after...</p></div>
  }

  const file1ModulesByWebpackId = file1ProcessedState.modulesByWebpackIdentifier.get()
  const file2ModulesByWebpackId = file2ProcessedState.modulesByWebpackIdentifier.get()

  const { modules } = compareFiles({
    file1ModulesByWebpackId,
    file2ModulesByWebpackId,
  })

  const modulesThatChanged = modules.changed.map((args) => {
    const { file1Module, file2Module } = args
    return (
      <li key={file1Module.moduleDatabaseId}>
        <ModuleLink module={file1Module} file={'file1'} includeFileInfo={true} /> vs
        <ModuleLink module={file2Module} file={'file2'} includeFileInfo={true} />
      </li>
    )
  })

  const file1OnlyModules = modules.onlyInFile1.map((module) => {
    return (
      <li key={module.moduleDatabaseId}>
        <ModuleLink module={module} file={'file1'} includeFileInfo={true} />
      </li>
    )
  })
  const file2OnlyModules = modules.onlyInFile2.map((module) => {
    return (
      <li key={module.moduleDatabaseId}>
        <ModuleLink module={module} file={'file2'} includeFileInfo={true} />
      </li>
    )
  })

  return (
    <div id="ModuleComparison">
      <div>
        <h2>Modules that changed</h2>
        <ul>
          {modulesThatChanged}
        </ul>
      </div>
      <div>
        <h2>Modules that exist only in file 1</h2>
        <ul>
          {file1OnlyModules}
        </ul>
      </div>
      <div>
        <h2>Modules that exist only in file 2</h2>
        <ul>
          {file2OnlyModules}
        </ul>
      </div>
    </div>
  )

}
