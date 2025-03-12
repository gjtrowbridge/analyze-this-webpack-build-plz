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
  [] Add a comparison feature
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
  const defaultModuleState: ReactModuleState = { ready: false }
  const defaultChunkState: ReactChunkState = { ready: false }
  const [selectedFile1, setSelectedFile1] = useState<string | null>(null)
  const [selectedFile2, setSelectedFile2] = useState<string | null>(null)
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
   * Load Modules and Chunks for main file
   */
  useModules({
    moduleState,
    selectedFile: selectedFile1,
    setModuleState,
    setErrorMessage: setModuleErrorMessage,
    isEnabled: view === "module" || view === "comparison",
  })
  useChunks({
    chunkState,
    selectedFile: selectedFile1,
    setChunkState,
    setErrorMessage: setChunkErrorMessage,
    isEnabled: view === "chunk" || view === "comparison",
  })
  /**
   * Load Modules and Chunks for comparison file (if comparing)
   */
  useModules({
    moduleState: moduleStateComparisonFile,
    selectedFile: selectedFile2,
    setModuleState: setModuleStateComparisonFile,
    setErrorMessage: setModuleErrorMessage,
    isEnabled: view === "comparison",
  })
  useChunks({
    chunkState: chunkStateComparisonFile,
    selectedFile: selectedFile2,
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
      selectedFile1={selectedFile1}
      setSelectedFile1={(f) => {
        if (f !== selectedFile1) {
          setSelectedFile1(f)

          // Make sure the chunks and modules reload if a new file is selected
          setModuleState(defaultModuleState)
          setChunkState(defaultChunkState)
        }

      }}
      selectedFile2={selectedFile2}
      setSelectedFile2={(f) => {
        if (f !== selectedFile2) {
          setSelectedFile2(f)

          // Make sure the chunks and modules reload if a new file is selected
          setModuleStateComparisonFile(defaultModuleState)
          setChunkStateComparisonFile(defaultChunkState)
        }
      }}
    />
  } else if (view === "comparison") {
    mainElement = <ComparisonView
      bothFilesAreSelected={selectedFile1 !== null && selectedFile2 !== null}
      moduleStates={{
        file1: moduleState,
        file2: moduleStateComparisonFile,
      }}
      chunkStates={{
        file1: chunkState,
        file2: chunkStateComparisonFile,
      }}
    />
    const isReady = (
      moduleState.ready &&
      moduleStateComparisonFile.ready &&
      chunkState.ready &&
      chunkStateComparisonFile.ready
    )
  } else if (view === "raw_file") {
    mainElement = <RawFileView fileName={selectedFile1} />
  } else {
    mainElement = null
  }

  return (
    <div className="App">
      <div className="TopBar">
        <a href="#" className={view === "file_selector" ? "active" : ""} onClick={() => setView("file_selector")}>Select File(s)</a>
        <a href="#" className={view === "module" ? "active" : ""} onClick={() => setView("module")}>Module View</a>
        <a href="#" className={view === "chunk" ? "active" : ""} onClick={() => setView("chunk")}>Chunk View</a>
        <a href="#" className={view === "raw_file" ? "active" : ""} onClick={() => setView("raw_file")}>See Entire Raw File</a>
        <a href="#" className={view === "comparison" ? "active" : ""} onClick={() => setView("comparison")}>Comparison View</a>
      </div>
      <h3>Main file: {selectedFile1}, Comparison file: {selectedFile2 ?? "None"}</h3>
      {mainElement}
    </div>
  )
}
