import { useState } from "react"
import { FileSelector } from './FileSelector'
import "./styles/App.css"
import { useFileNames } from '../hooks/useFiles'
import { useHookstate } from '@hookstate/core'
import { errorsState, file1ProcessedGlobalState, filesState } from '../globalState'
import { NavLink, Outlet } from 'react-router'


export function App() {
  const files = useHookstate(filesState)
  const errors = useHookstate(errorsState)
  const f = files.get()
  const fileNames = useFileNames()
  const [view, setView] = useState<"module" | "chunk" | "file_selector" | "comparison" | "raw_file">("file_selector")


  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)

  // TODO: Make it so these don't lose unmount / lose state between view changes...
  let mainElement = null
  if (view === "file_selector") {
    mainElement = <FileSelector />
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
    </div>
  )
}
