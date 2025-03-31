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
import { ChunkComparisonData, compareFiles, ModuleComparisonData } from '../helpers/comparison'
import { ModuleLink } from './ModuleLink'
import { ChunkLink } from './ChunkLink'

export function ComparisonView() {
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
  const file1ChunksByWebpackId = file1ProcessedState.chunksByWebpackId.get()
  const file2ChunksByWebpackId = file2ProcessedState.chunksByWebpackId.get()

  const { modules, chunks } = compareFiles({
    file1ModulesByWebpackId,
    file2ModulesByWebpackId,
    file1ChunksByWebpackId,
    file2ChunksByWebpackId,
  })

  return (
    <div id="ComparisonView">
      <ModuleComparison data={modules} />
      <ChunkComparison data={chunks} />
    </div>
  )
}

function ModuleComparison(props: { data: ModuleComparisonData}) {
  const { data } = props
  const { changed, onlyInFile1, onlyInFile2 } = data
  const modulesThatChanged = changed.map((args) => {
    const { file1Module, file2Module } = args
    return (
      <li key={file1Module.moduleDatabaseId}>
        <ModuleLink module={file1Module} file={'file1'} includeFileInfo={true} /> vs <ModuleLink module={file2Module} file={'file2'} includeFileInfo={true} />
      </li>
    )
  })

  const file1OnlyModules = onlyInFile1.map((module) => {
    return (
      <li key={module.moduleDatabaseId}>
        <ModuleLink module={module} file={'file1'} includeFileInfo={true} />
      </li>
    )
  })
  const file2OnlyModules = onlyInFile2.map((module) => {
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

function ChunkComparison(props: { data: ChunkComparisonData}) {
  const { data } = props
  const { changed, onlyInFile1, onlyInFile2 } = data
  const chunksThatChanged = changed.map((args) => {
    const { file1Chunk, file2Chunk } = args
    return (
      <li key={file1Chunk.chunkDatabaseId}>
        <ChunkLink chunk={file1Chunk} file={'file1'} includeFileInfo={true} /> vs <ChunkLink chunk={file2Chunk} file={'file2'} includeFileInfo={true} />
      </li>
    )
  })

  const file1OnlyChunks = onlyInFile1.map((chunk) => {
    return (
      <li key={chunk.chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} includeFileInfo={true} />
      </li>
    )
  })
  const file2OnlyChunks = onlyInFile2.map((chunk) => {
    return (
      <li key={chunk.chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file2'} includeFileInfo={true} />
      </li>
    )
  })

  return (
    <div id="ChunkComparison">
      <div>
        <h2>Chunks that changed</h2>
        <ul>
          {chunksThatChanged}
        </ul>
      </div>
      <div>
        <h2>Chunks that exist only in file 1</h2>
        <ul>
          {file1OnlyChunks}
        </ul>
      </div>
      <div>
        <h2>Chunks that exist only in file 2</h2>
        <ul>
          {file2OnlyChunks}
        </ul>
      </div>
    </div>
  )
}
