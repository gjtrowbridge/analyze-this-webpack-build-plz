import { useState } from "react"
import { FileSelector } from './FileSelector'
import "./styles/App.css"
import { useFileNames } from '../hooks/useFiles'
import { useHookstate } from '@hookstate/core'
import {
  errorsGlobalState,
  file1ProcessedGlobalState,
  file2ProcessedGlobalState,
  filesGlobalState
} from '../globalState'
import { NavLink, Outlet } from 'react-router'
import { CircularProgress, Snackbar } from '@mui/material'


export function App() {
  const files = useHookstate(filesGlobalState)
  const errors = useHookstate(errorsGlobalState)
  const f = files.get()
  const fileNames = useFileNames()
  const [view, setView] = useState<"module" | "chunk" | "file_selector" | "comparison" | "raw_file">("file_selector")
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)

  // TODO: Make it so these don't lose unmount / lose state between view changes...
  let mainElement = null
  if (view === "file_selector") {
    mainElement = <FileSelector />
  } else {
    mainElement = null
  }

  const e = errorsGlobalState.get()
  const errorWarnings = e.map((a, index) => {
    return <p className="error" key={index}>{a}</p>
  })

  return (
    <div className="App">
      <div className="TopBar">
        <NavLink to={"/"} className={({ isActive }) => {
          return isActive ? "active" : ""
        }}>Select File(s)</NavLink>
        <NavLink to={"/modules"} className={({ isActive }) => {
          return isActive ? "active" : ""
        }}>Module View</NavLink>
        <NavLink to={"/chunks"} className={({ isActive }) => {
          return isActive ? "active" : ""
        }}>Chunk View</NavLink>
        <NavLink to={"/comparison"} className={({ isActive }) => {
          return isActive ? "active" : ""
        }}>Comparison</NavLink>
      </div>
      <div>
        {errorWarnings}
      </div>
      <p>Main file: {fileNames.file1}, Comparison file: {fileNames.file2}</p>
      <Outlet />
      <Snackbar
        open={file1ProcessedState.status.get() === 'LOADING'}
        message={'File 1 Is Loading'}
        action={(
          <CircularProgress variant="determinate" value={file1ProcessedState.progress.modules.get()} />
        )}
      />
      <Snackbar
        open={file2ProcessedState.status.get() === 'LOADING'}
        message={'File 2 Is Loading'}
        action={(
          <CircularProgress variant="determinate" value={file2ProcessedState.progress.modules.get()} />
        )}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      />
    </div>
  )
}
