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
import { useFileNames, useRefreshFiles } from '../hooks/useFiles'
import { useHookstate } from '@hookstate/core'
import { chunksStateFile1, errorsState, filesState, modulesStateFile1 } from '../globalState'


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

  const msf1 = useHookstate(modulesStateFile1)
  const msf2 = useHookstate(modulesStateFile1)
  const csf1 = useHookstate(chunksStateFile1)
  const csf2 = useHookstate(chunksStateFile1)

  // Hack to not lose my mind converting everything to take immutables
  const moduleState1 = msf1.get() as ReactModuleState | null
  const moduleState2 = msf2.get() as ReactModuleState | null
  const chunkState1 = csf1.get() as ReactChunkState | null
  const chunkState2 = csf2.get() as ReactChunkState | null

  // TODO: Make it so these don't lose unmount / lose state between view changes...
  let mainElement = null
  if (view === "module") {
    const moduleInspector = moduleState1?.ready ? <ModuleInspector modules={moduleState1.modules} /> : null
    mainElement = <LoadingBoundary isLoading={!moduleState1?.ready} element={moduleInspector} />
  } else if (view === "chunk") {
    const chunkInspector = chunkState1?.ready ? <ChunkInspector chunks={chunkState1.chunks} /> : null
    mainElement = <LoadingBoundary isLoading={!chunkState1?.ready} element={chunkInspector} />
  } else if (view === "file_selector") {
    mainElement = <FileSelector
      refreshFilesFn={refreshFilesFn}
    />
  } else if (view === "comparison") {
    mainElement = <ComparisonView
      moduleStates={{
        file1: moduleState1,
        file2: moduleState2,
      }}
      chunkStates={{
        file1: chunkState1,
        file2: chunkState2,
      }}
    />
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
