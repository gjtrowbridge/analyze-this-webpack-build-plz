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
import { NavLink, Outlet, useLocation } from 'react-router'
import { AppBar, Box, CircularProgress, Snackbar, Tab, Tabs, Typography } from '@mui/material'

export function App() {
  const files = useHookstate(filesGlobalState)
  const errors = useHookstate(errorsGlobalState)
  const f = files.get()
  const fileNames = useFileNames()
  const [view, setView] = useState<"module" | "chunk" | "file_selector" | "comparison" | "raw_file">("file_selector")
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)
  const location = useLocation()

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

  const getCurrentTab = () => {
    const path = location.pathname
    if (path === '/') return 0
    if (path.startsWith('/modules')) return 1
    if (path.startsWith('/chunks')) return 2
    if (path.startsWith('/assets')) return 3
    if (path.startsWith('/named-chunk-groups')) return 4
    if (path.startsWith('/comparison')) return 5
    return 0
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Tabs 
          value={getCurrentTab()} 
          indicatorColor="secondary"
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label="Select File(s)" 
            component={NavLink} 
            to="/" 
            sx={{ color: 'inherit', textDecoration: 'none' }}
          />
          <Tab 
            label="Module View" 
            component={NavLink} 
            to="/modules" 
            sx={{ color: 'inherit', textDecoration: 'none' }}
          />
          <Tab 
            label="Chunk View" 
            component={NavLink} 
            to="/chunks" 
            sx={{ color: 'inherit', textDecoration: 'none' }}
          />
          <Tab 
            label="Asset View" 
            component={NavLink} 
            to="/assets" 
            sx={{ color: 'inherit', textDecoration: 'none' }}
          />
          <Tab 
            label="Named Chunk Groups" 
            component={NavLink} 
            to="/named-chunk-groups" 
            sx={{ color: 'inherit', textDecoration: 'none' }}
          />
          <Tab 
            label="Comparison" 
            component={NavLink} 
            to="/comparison" 
            sx={{ color: 'inherit', textDecoration: 'none' }}
          />
        </Tabs>
      </AppBar>
      
      <Box sx={{ p: 2 }}>
        {errorWarnings}
        <Typography variant="body1" sx={{ mb: 2 }}>
          Main file: {fileNames.file1}, Comparison file: {fileNames.file2}
        </Typography>
        <Outlet />
      </Box>

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
    </Box>
  )
}
