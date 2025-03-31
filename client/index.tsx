import './index.css';

import { createRoot } from 'react-dom/client'
import { App } from "./components/App"
import { BrowserRouter, Route, Routes } from 'react-router'
import { SetupState } from './components/SetupState'
import { ModuleInspector } from './components/ModuleInspector'
import { ChunkInspector } from './components/ChunkInspector'
import { FileSelector } from './components/FileSelector'
import { ModuleRowPage } from './components/ModuleRowPage'
import { ChunkRowPage } from './components/ChunkRowPage'

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app'))
root.render(
  <BrowserRouter>
    <SetupState />
    <Routes>
      <Route element={<App />}>
        <Route index element={<FileSelector />} />
        <Route path="modules">
          <Route index element={<ModuleInspector />} />
          <Route path=":moduleDatabaseId" element={<ModuleRowPage />} />
        </Route>
        <Route path="chunks">
          <Route index element={<ChunkInspector />} />
          <Route path=":chunkDatabaseId" element={<ChunkRowPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
