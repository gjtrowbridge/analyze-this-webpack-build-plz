import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createRoot } from 'react-dom/client'
import { App } from "./components/App"
import { BrowserRouter, Route, Routes } from 'react-router'
import { SetupState } from './components/SetupState'
import { ModuleInspector } from './components/ModuleInspector'
import { ChunkInspector } from './components/ChunkInspector'
import { AssetInspector } from './components/AssetInspector'
import { NamedChunkGroupInspector } from './components/NamedChunkGroupInspector'
import { FileSelector } from './components/FileSelector'
import { ModuleRowPage } from './components/ModuleRowPage'
import { ChunkRowPage } from './components/ChunkRowPage'
import { AssetRowPage } from './components/AssetRowPage'
import { NamedChunkGroupRowPage } from './components/NamedChunkGroupRowPage'
import { ComparisonView } from './components/ComparisonView'
import { CompareChunkPage } from './components/CompareChunkPage';

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
          <Route path="file1/:moduleDatabaseId" element={<ModuleRowPage file={'file1'} />} />
          <Route path="file2/:moduleDatabaseId" element={<ModuleRowPage file={'file2'} />} />
        </Route>
        <Route path="chunks">
          <Route index element={<ChunkInspector />} />
          <Route path="file1/:chunkDatabaseId" element={<ChunkRowPage file={'file1'} />} />
          <Route path="file2/:chunkDatabaseId" element={<ChunkRowPage file={'file2'} />} />
        </Route>
        <Route path="assets">
          <Route index element={<AssetInspector />} />
          <Route path="file1/:assetDatabaseId" element={<AssetRowPage file={'file1'} />} />
          <Route path="file2/:assetDatabaseId" element={<AssetRowPage file={'file2'} />} />
        </Route>
        <Route path="named-chunk-groups">
          <Route index element={<NamedChunkGroupInspector />} />
          <Route path="file1/:namedChunkGroupDatabaseId" element={<NamedChunkGroupRowPage file={'file1'} />} />
          <Route path="file2/:namedChunkGroupDatabaseId" element={<NamedChunkGroupRowPage file={'file2'} />} />
        </Route>
        <Route path="comparison">
          <Route index element={<ComparisonView />} />
          <Route path="chunks/:chunkDatabaseIdFile1/:chunkDatabaseIdFile2" element={<CompareChunkPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
