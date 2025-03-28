import { useCallback, useState } from "react"
import {ModuleInspector} from "./ModuleInspector"
import { LoadingBoundary } from './LoadingBoundary'
import { useModules } from '../hooks/useModules'
import type { ReactChunkState, ReactModuleState } from '../types'
import { useChunks } from '../hooks/useChunks'
import { ChunkInspector } from './ChunkInspector'
import { FileSelector } from './FileSelector'
// import { ComparisonView } from './ComparisonView'
import "./styles/App.css"
import { useFileNames, useRefreshFiles } from '../hooks/useFiles'
import { useHookstate } from '@hookstate/core'
import { chunksStateFile1, errorsState, file1ProcessedGlobalState, filesState, modulesStateFile1 } from '../globalState'
import { useProcessor } from '../hooks/useProcessor'


export function App() {
  const files = useHookstate(filesState)
  const errors = useHookstate(errorsState)
  const f = files.get()
  const fileNames = useFileNames()
  const [view, setView] = useState<"module" | "chunk" | "file_selector" | "comparison" | "raw_file">("file_selector")

  /**
   * Load global state
   */
  const refreshFilesFn = useRefreshFiles()
  useModules()
  useChunks()
  useProcessor()

  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)

  // TODO: Make it so these don't lose unmount / lose state between view changes...
  let mainElement = null
  if (view === "module") {
    const stateOrNull = file1ProcessedState.ornull
    const moduleInspector = stateOrNull !== null ?
      <ModuleInspector
        modulesByDatabaseId={stateOrNull.modulesByDatabaseId.get()}
        moduleInclusionReasons={stateOrNull.moduleInclusionReasons.get()}
      />
      : null
    mainElement = <LoadingBoundary isLoading={stateOrNull === null} element={moduleInspector} />
  } else if (view === "chunk") {
    const stateOrNull = file1ProcessedState.ornull
    const chunkInspector = stateOrNull !== null ?
      <ChunkInspector
        chunksByDatabaseId={stateOrNull.chunksByDatabaseId.get()}
      />
      : null
    mainElement = <LoadingBoundary isLoading={stateOrNull === null} element={chunkInspector} />
  } else if (view === "file_selector") {
    mainElement = <FileSelector
      refreshFilesFn={refreshFilesFn}
    />
  // } else if (view === "comparison") {
  //   mainElement = <ComparisonView
  //     moduleStates={{
  //       file1: moduleState1,
  //       file2: moduleState2,
  //     }}
  //     chunkStates={{
  //       file1: chunkState1,
  //       file2: chunkState2,
  //     }}
  //   />
  } else {
    mainElement = null
  }

  const e = errorsState.get()
  const errorWarnings = e.map((a, index) => {
    return <p className="error" key={index}>{a}</p>
  })

  return (
    <div className="App">
      <div className="TopBar">
        <a href="#" className={view === "file_selector" ? "active" : ""} onClick={() => setView("file_selector")}>Select File(s)</a>
        <a href="#" className={view === "module" ? "active" : ""} onClick={() => setView("module")}>Module View</a>
        <a href="#" className={view === "chunk" ? "active" : ""} onClick={() => setView("chunk")}>Chunk View</a>
        <a href="#" className={view === "comparison" ? "active" : ""} onClick={() => setView("comparison")}>Comparison View</a>
      </div>
      <div>
        {errorWarnings}
      </div>
      <p>Main file: {fileNames.file1}, Comparison file: {fileNames.file2}</p>
      {mainElement}
    </div>
  )
}
