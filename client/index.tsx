import './index.css';

import { createRoot } from 'react-dom/client'
import { App } from "./components/App"
import { BrowserRouter, Route, Routes } from 'react-router'
import { SetupState } from './components/SetupState'
import { ModuleInspector } from './components/ModuleInspector'
import { ChunkInspector } from './components/ChunkInspector'
import { FileSelector } from './components/FileSelector'

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
        <Route path="modules" element={<ModuleInspector />} />
        <Route path="chunks" element={<ChunkInspector />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
