import { ChunksById, ModulesById, ReactChunkState, ReactModuleState } from '../types'
import { ComparisonData, getComparisonData } from '../helpers/comparison'
import { StatsChunk, StatsModule } from 'webpack'
import { ChunkRow } from './ChunkRow'
import { useState } from 'react'
import { ModuleRow } from './ModuleRow'
import { useFileNames } from '../hooks/useFiles'

function ChunkComparison(props: {
  file1Name: string,
  file2Name: string,
  chunk1: StatsChunk | null
  chunk2: StatsChunk | null
}) {
  const { chunk1, chunk2 , file1Name, file2Name } = props
  const [showRawInfo1, setShowRawInfo1] = useState<boolean>(false)
  const [showRawInfo2, setShowRawInfo2] = useState<boolean>(false)


  const chunk1Rendered = chunk1 === null ? null : (<ChunkRow chunk={chunk1} showRawInfo={showRawInfo1} setShowRawInfo={() => { setShowRawInfo1(!showRawInfo1) }} />)
  const chunk2Rendered = chunk2 === null ? null : ( <ChunkRow chunk={chunk2} showRawInfo={showRawInfo2} setShowRawInfo={() => { setShowRawInfo2(!showRawInfo2) }} />)
  const chunkForHeader = chunk1 === null ? chunk2 : chunk1
  return (
    <div>
      <h3>Chunk Id: {chunkForHeader.id} ; Chunk Name: {chunkForHeader.names.join(",")}</h3>
      { chunk1Rendered !== null && (<h4>From {file1Name}:</h4>) }
      {chunk1Rendered}
      { chunk2Rendered !== null && (<h4>From {file2Name}:</h4>) }
      {chunk2Rendered}
    </div>
  )
}

function ModuleComparison(props: {
  file1Name: string,
  file2Name: string,
  module1: StatsModule | null
  module2: StatsModule | null
}) {
  const { module1, module2 , file1Name, file2Name } = props
  const [showRawInfo1, setShowRawInfo1] = useState<boolean>(false)
  const [showRawInfo2, setShowRawInfo2] = useState<boolean>(false)


  const module1Rendered = module1 === null ? null : (<ModuleRow module={module1} showRawInfo={showRawInfo1} setShowRawInfo={() => { setShowRawInfo1(!showRawInfo1) }} />)
  const module2Rendered = module2 === null ? null : ( <ModuleRow module={module2} showRawInfo={showRawInfo2} setShowRawInfo={() => { setShowRawInfo2(!showRawInfo2) }} />)
  return (
    <div>
      <h3>Module Id: {module1.identifier} ; Module Name: {module1.name}</h3>
      { module1Rendered !== null && (<h4>From {file1Name}:</h4>) }
      {module1Rendered}
      { module2Rendered !== null && (<h4>From {file2Name}:</h4>) }
      {module2Rendered}
    </div>
  )
}

function HydratedComparison(props: {
  file1Name: string,
  file2Name: string,
  data: ComparisonData
  chunksById1: ChunksById
  chunksById2: ChunksById
  modulesById1: ModulesById
  modulesById2: ModulesById
}) {
  const {
    file1Name,
    file2Name,
    data,
    chunksById1,
    chunksById2,
    modulesById1,
    modulesById2,
  } = props
  const chunksChanged = data.chunks.changed.map((chunkId) => {
    const c1 = chunksById1.get(chunkId) || null
    const c2 = chunksById2.get(chunkId) || null
    return <ChunkComparison key={chunkId} chunk1={c1} chunk2={c2} file1Name={file1Name} file2Name={file2Name} />
  })
  const chunksOnlyFile1 = data.chunks.onlyInFile1.map((chunkId) => {
    const c1 = chunksById1.get(chunkId) || null
    return <ChunkComparison key={chunkId} chunk1={c1} chunk2={null} file1Name={file1Name} file2Name={file2Name}  />
  })
  const chunksOnlyFile2 = data.chunks.onlyInFile2.map((chunkId) => {
    const c2 = chunksById2.get(chunkId) || null
    return <ChunkComparison key={chunkId} chunk1={null} chunk2={c2} file1Name={file1Name} file2Name={file2Name}  />
  })

  const modulesChanged = data.modules.changed.map((moduleId) => {
    const m1 = modulesById1.get(moduleId) || null
    const m2 = modulesById2.get(moduleId) || null
    return <ModuleComparison key={`${moduleId}-changed`} module1={m1} module2={m2} file1Name={file1Name} file2Name={file2Name} />
  })
  const modulesOnlyFile1 = data.modules.onlyInFile1.map((moduleId) => {
    const m1 = modulesById1.get(moduleId) || null
    return <ModuleComparison key={`${moduleId}-f1`} module1={m1} module2={null} file1Name={file1Name} file2Name={file2Name}  />
  })
  const modulesOnlyFile2 = data.modules.onlyInFile2.map((moduleId) => {
    const m2 = modulesById2.get(moduleId) || null
    return <ModuleComparison key={`${moduleId}-f2`} module1={null} module2={m2} file1Name={file1Name} file2Name={file2Name}  />
  })

  return (
    <div>
      <h1>Chunks</h1>
      <div>
        <h2>Changed</h2>
        <div>{chunksChanged}</div>
        <h2>Only in file 1</h2>
        <div>{chunksOnlyFile1}</div>
        <h2>Only in file 2</h2>
        <div>{chunksOnlyFile2}</div>
      </div>
      <h1>Modules</h1>
      <div>
        <h2>Changed</h2>
        <div>{modulesChanged}</div>
        <h2>Only in file 1</h2>
        <div>{modulesOnlyFile1}</div>
        <h2>Only in file 2</h2>
        <div>{modulesOnlyFile2}</div>
      </div>
    </div>
  )
}

export function ComparisonView(props: {
  moduleStates: {
    file1: ReactModuleState | null,
    file2: ReactModuleState | null,
  },
  chunkStates: {
    file1: ReactChunkState | null,
    file2: ReactChunkState | null,
  }
}) {
  const {
    moduleStates,
    chunkStates
  } = props
  const isLoaded = moduleStates.file1?.ready &&
    moduleStates.file2?.ready &&
    chunkStates.file1?.ready &&
    chunkStates.file2?.ready
  const fileNames = useFileNames()

  // Typescript isn't smart enough to realize this is the same as isLoaded...
  let mainComparisonUI = null
  if (
    moduleStates.file1?.ready &&
    moduleStates.file2?.ready &&
    chunkStates.file1?.ready &&
    chunkStates.file2?.ready
  ) {
    const {
      data,
      chunksById1,
      chunksById2,
      modulesById1,
      modulesById2,
    } = getComparisonData({
      modules: {
        file1: moduleStates.file1.modules,
        file2: moduleStates.file2.modules,
      },
      chunks:{
        file1: chunkStates.file1.chunks,
        file2: chunkStates.file2.chunks,
      }
    })
    mainComparisonUI = <HydratedComparison
      file1Name={fileNames.file1}
      file2Name={fileNames.file2}
      data={data}
      chunksById1={chunksById1}
      chunksById2={chunksById2}
      modulesById1={modulesById1}
      modulesById2={modulesById2}
    />
  }

  return (
    <div className="ComparisonView">
      {!fileNames.bothAreSelected && <p className={"warning"}>You need to select a main file AND a comparison file!</p>}
      {fileNames.bothAreSelected && !isLoaded && <p>Loading...</p>}
      {mainComparisonUI}
    </div>
  )
}
