import { useCallback, useState } from "react"
import {ModuleInspector} from "./ModuleInspector"
import { LoadingBoundary } from './LoadingBoundary'
import { useModules } from '../hooks/useModules'
import type { ReactChunkState, ReactModuleState } from '../types'
import { useChunks } from '../hooks/useChunks'
import { ChunkInspector } from './ChunkInspector'
import { FileSelector } from './FileSelector'
import { ComparisonView } from './ComparisonView'
import "./styles/App.css"
import { RawFileView } from './RawFileView'
import { useFiles } from '../hooks/useFiles'
import { useHookstate } from '@hookstate/core'
import { filesState } from '../globalState'

/*
  [X] useEffect to load file
  [X] set up new route to use default file if none specified
  [X] Get module inspector working again
  [X] Improve sorting UI
  [X] Add support for counting opt bailout reasons
  [X] switch to module identifier
  [X] Add chunks view
  [X] Add JSON inspector for raw view (with default everything collapsed)
  [X] Re-add support for uploading and swapping between files
  [X] Make ModuleRow and ChunkRow a bit prettier (table view? tab view? box shadow? better formatting?)
  [] Add cleaner top-level info (std dev, mean, total size, number of chunks/modules)
  [X] Add a comparison feature
    - Which chunks went away
    - Which chunks were added
    - Which chunks changed size
    - Which modules moved between chunks
    - Possibly something indicating std deviation of size among chunks?
  [] Add modals and/or deep link for detail view
    [] Add same for json raw view
  [] Make it so it's refreshable without losing state (either state params in URL or localStorage for state?)

 */
export function App() {
  const files = useHookstate(filesState)
  const f = files.get()

  const defaultModuleState: ReactModuleState = { ready: false }
  const defaultChunkState: ReactChunkState = { ready: false }
  const [view, setView] = useState<"module" | "chunk" | "file_selector" | "comparison" | "raw_file">("file_selector")
  const [moduleState, setModuleState] = useState<ReactModuleState>(defaultModuleState)
  const [moduleStateComparisonFile, setModuleStateComparisonFile] = useState<ReactModuleState>(defaultModuleState)
  const [chunkState, setChunkState] = useState<ReactChunkState>(defaultChunkState)
  const [chunkStateComparisonFile, setChunkStateComparisonFile] = useState<ReactChunkState>(defaultChunkState)
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({})


  const setModuleErrorMessage = useCallback((errorMessage: string) => {
    setErrorMessages({
      ...errorMessages,
      modules: errorMessage,
    })
  }, [setErrorMessages])
  const setChunkErrorMessage = useCallback((errorMessage: string) => {
    setErrorMessages({
      ...errorMessages,
      chunks: errorMessage,
    })
  }, [setErrorMessages])

  /**
   * Load available files
   */
  const refreshFilesFn = useFiles()

  /**
   * Load Modules and Chunks for main file
   */
  useModules({
    moduleState,
    selectedFileId: f.status === 'LOADED' && f.selectedFileId1 || null,
    setModuleState,
    setErrorMessage: setModuleErrorMessage,
    isEnabled: view === "module" || view === "comparison",
  })
  useChunks({
    chunkState,
    selectedFileId: f.status === 'LOADED' && f.selectedFileId1 || null,
    setChunkState,
    setErrorMessage: setChunkErrorMessage,
    isEnabled: view === "chunk" || view === "comparison",
  })
  /**
   * Load Modules and Chunks for comparison file (if comparing)
   */
  useModules({
    moduleState: moduleStateComparisonFile,
    selectedFileId: f.status === 'LOADED' && f.selectedFileId2 || null,
    setModuleState: setModuleStateComparisonFile,
    setErrorMessage: setModuleErrorMessage,
    isEnabled: view === "comparison",
  })
  useChunks({
    chunkState: chunkStateComparisonFile,
    selectedFileId: f.status === 'LOADED' && f.selectedFileId2 || null,
    setChunkState: setChunkStateComparisonFile,
    setErrorMessage: setChunkErrorMessage,
    isEnabled: view === "comparison",
  })

  // TODO: Make it so these don't lose unmount / lose state between view changes...
  const moduleInspector = moduleState.ready ? <ModuleInspector modules={moduleState.modules} /> : null
  const chunkInspector = chunkState.ready ? <ChunkInspector chunks={chunkState.chunks} /> : null
  let mainElement = null
  if (view === "module") {
    mainElement = <LoadingBoundary isLoading={!moduleState.ready} element={moduleInspector} />
  } else if (view === "chunk") {
    mainElement = <LoadingBoundary isLoading={!chunkState.ready} element={chunkInspector} />
  } else if (view === "file_selector") {
    mainElement = <FileSelector
      refreshFilesFn={refreshFilesFn}
    />
  // } else if (view === "comparison") {
  //   mainElement = <ComparisonView
  //     file1Name={"placeholder"}
  //     file2Name={"fixme"}
  //     bothFilesAreSelected={selectedFileId1 !== null && selectedFileId2 !== null}
  //     moduleStates={{
  //       file1: moduleState,
  //       file2: moduleStateComparisonFile,
  //     }}
  //     chunkStates={{
  //       file1: chunkState,
  //       file2: chunkStateComparisonFile,
  //     }}
  //   />
  //   const isReady = (
  //     moduleState.ready &&
  //     moduleStateComparisonFile.ready &&
  //     chunkState.ready &&
  //     chunkStateComparisonFile.ready
  //   )
  } else {
    mainElement = null
  }

  return (
    <div className="App">
      <div className="TopBar">
        <a href="#" className={view === "file_selector" ? "active" : ""} onClick={() => setView("file_selector")}>Select File(s)</a>
        <a href="#" className={view === "module" ? "active" : ""} onClick={() => setView("module")}>Module View</a>
        <a href="#" className={view === "chunk" ? "active" : ""} onClick={() => setView("chunk")}>Chunk View</a>
        <a href="#" className={view === "comparison" ? "active" : ""} onClick={() => setView("comparison")}>Comparison View</a>
      </div>
      {mainElement}
    </div>
  )
}
