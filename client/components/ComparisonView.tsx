import { ImmutableMap, useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState, file2ProcessedGlobalState, filesGlobalState } from '../globalState'
import { ChunkComparisonData, compareFiles, ModuleComparisonData } from '../helpers/comparison'
import { ModuleLink } from './ModuleLink'
import { ChunkLink } from './ChunkLink'
import { CompareChunkLink } from './CompareChunkLink'
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { GridColDef, DataGrid } from '@mui/x-data-grid'
import { formatNumber, inKB } from '../helpers/math'
import { getModuleName, getModuleNumberOfChunks, getModuleSize } from '../helpers/modules'

export function ComparisonView() {
  const fileData = useHookstate(filesGlobalState)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)

  const file1OrNull = file1ProcessedState.ornull
  const file2OrNull = file2ProcessedState.ornull

  const loadedFileData = fileData.get()
  if (loadedFileData.status === "LOADED" && loadedFileData.selectedFileId2 === undefined) {
    return <div id="ModuleComparison" className={"error"}><p>Please select a comparison file first!</p></div>
  }

  if (file1OrNull === null || file2OrNull === null) {
    return <div id="ModuleComparison"><p>Loading and processing files, will show comparison after...</p></div>
  }

  const file1ModulesByWebpackId = file1ProcessedState.modulesByWebpackIdentifier.get()
  const file2ModulesByWebpackId = file2ProcessedState.modulesByWebpackIdentifier.get()
  const file1ChunksByWebpackId = file1ProcessedState.chunksByWebpackId.get()
  const file2ChunksByWebpackId = file2ProcessedState.chunksByWebpackId.get()
  const file1ModulesByDatabaseId = file1ProcessedState.modulesByDatabaseId.get()
  const file2ModulesByDatabaseId = file2ProcessedState.modulesByDatabaseId.get()
  const file1AssetsByDatabaseId = file1ProcessedState.assetsByDatabaseId.get()
  const file2AssetsByDatabaseId = file2ProcessedState.assetsByDatabaseId.get()

  const { modules, chunks, assets } = compareFiles({
    file1ModulesByDatabaseId,
    file2ModulesByDatabaseId,
    file1ModulesByWebpackId,
    file2ModulesByWebpackId,
    file1ChunksByWebpackId,
    file2ChunksByWebpackId,
    file1AssetsByDatabaseId,
    file2AssetsByDatabaseId,
  })

  console.log('xcxc assets', assets)

  return (
    <div id="ComparisonView">
      <ModuleComparison data={modules} />
      <ChunkComparison data={chunks} />
      <RelevantModules data={{
        relevantModules: modules.relevant,
        file1ModulesByWebpackId,
        file2ModulesByWebpackId,
      }} />
    </div>
  )
}

function ModuleComparison(props: { data: ModuleComparisonData}) {
  const { data } = props
  const { changed, onlyInFile1, onlyInFile2 } = data
  const modulesThatChanged = changed.map((args) => {
    const { file1Module, file2Module } = args
    return (
      <li key={file1Module.moduleDatabaseId}>
        <ModuleLink module={file1Module} file={'file1'} includeFileInfo={true} /> vs <ModuleLink module={file2Module} file={'file2'} includeFileInfo={true} />
      </li>
    )
  })

  const file1OnlyModules = onlyInFile1.map((module) => {
    return (
      <li key={module.moduleDatabaseId}>
        <ModuleLink module={module} file={'file1'} includeFileInfo={true} />
      </li>
    )
  })
  const file2OnlyModules = onlyInFile2.map((module) => {
    return (
      <li key={module.moduleDatabaseId}>
        <ModuleLink module={module} file={'file2'} includeFileInfo={true} />
      </li>
    )
  })

  return (
    <div id="ModuleComparison">
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Modules that changed ({changed.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {modulesThatChanged}
          </ul>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Modules that exist only in file 1 ({onlyInFile1.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {file1OnlyModules}
          </ul>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Modules that exist only in file 2 ({onlyInFile2.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {file2OnlyModules}
          </ul>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

function ChunkComparison(props: { data: ChunkComparisonData}) {
  const { data } = props
  const { changed, onlyInFile1, onlyInFile2 } = data
  const chunksThatChanged = changed.map((args) => {
    const { file1Chunk, file2Chunk } = args
    return (
      <li key={file1Chunk.chunkDatabaseId}>
        <CompareChunkLink chunk1={file1Chunk} chunk2={file2Chunk} />
      </li>
    )
  })

  const file1OnlyChunks = onlyInFile1.map((chunk) => {
    return (
      <li key={chunk.chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} includeFileInfo={true} />
      </li>
    )
  })
  const file2OnlyChunks = onlyInFile2.map((chunk) => {
    return (
      <li key={chunk.chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file2'} includeFileInfo={true} />
      </li>
    )
  })

  return (
    <div id="ChunkComparison">
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Chunks that changed ({changed.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {chunksThatChanged}
          </ul>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Chunks that exist only in file 1 ({onlyInFile1.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {file1OnlyChunks}
          </ul>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Chunks that exist only in file 2 ({onlyInFile2.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {file2OnlyChunks}
          </ul>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

function RelevantModules(props: {
  data:{
    relevantModules: Set<string>,
    file1ModulesByWebpackId: ImmutableMap<string, ProcessedModuleInfo>,
    file2ModulesByWebpackId: ImmutableMap<string, ProcessedModuleInfo>,
  }
}) {
  const { data } = props
  const { relevantModules, file1ModulesByWebpackId, file2ModulesByWebpackId } = data
  const tableColumns: Array<GridColDef> = [
    { field: 'name', headerName: 'Name', width: 300},
    { field: 'moduleSizeFile1', headerName: 'Module Size (File 1)', width: 150},
    { field: 'moduleSizeFile2', headerName: 'Module Size (File 2)', width: 150},
    { field: 'differenceInModuleSize', headerName: 'Diff', width: 150},
    { field: 'numChunksFile1', headerName: '# Chunks (File 1)', width: 150},
    { field: 'numChunksFile2', headerName: '# Chunks (File 2)', width: 150},
    { field: 'differenceInNumChunks', headerName: 'Diff', width: 150},
    { field: 'totalSizeFile1', headerName: 'Total Size (File 1)', width: 150},
    { field: 'totalSizeFile2', headerName: 'Total Size (File 2)', width: 150},
    { field: 'differenceInTotalSize', headerName: 'Total Diff', width: 150},
  ]
  const tableData: Array<{
    id: string,
    name: string,
    moduleSizeFile1: number,
    moduleSizeFile2: number,
    differenceInModuleSize: number,
    numChunksFile1: number,
    numChunksFile2: number,
    differenceInNumChunks: number,
    totalSizeFile1: number,
    totalSizeFile2: number,
    differenceInTotalSize: number,
  }> = Array.from(relevantModules).map((moduleId: string) => {
    const module1 = file1ModulesByWebpackId.get(moduleId)
    const module2 = file2ModulesByWebpackId.get(moduleId)

    const name = module1 ?
      getModuleName({
        module: module1,
        useIndividualModuleName: true,
      }) :
      getModuleName({
        module: module2,
        useIndividualModuleName: true,
      })
    const moduleSizeFile1 = getModuleSize({
      module: module1,
      includeSubModules: false,
    })
    const moduleSizeFile2 =  getModuleSize({
      module: module2,
      includeSubModules: false,
    })
    const differenceInModuleSize = moduleSizeFile2 - moduleSizeFile1
    const numChunksFile1 = getModuleNumberOfChunks({
      module: module1,
      includeChunksFromSuperModules: true,
    })
    const numChunksFile2 = getModuleNumberOfChunks({
      module: module2,
      includeChunksFromSuperModules: true,
    })
    const differenceInNumChunks = numChunksFile2 - numChunksFile1
    const totalSizeFile1 = numChunksFile1 * moduleSizeFile1
    const totalSizeFile2 = numChunksFile2 * moduleSizeFile2
    const differenceInTotalSize = totalSizeFile2 - totalSizeFile1

    return {
      id: moduleId,
      name,
      moduleSizeFile1,
      moduleSizeFile2,
      differenceInModuleSize,
      numChunksFile1,
      numChunksFile2,
      differenceInNumChunks,
      totalSizeFile1,
      totalSizeFile2,
      differenceInTotalSize,
    }
  })
  const filteredTableData = tableData.filter((row) => row.differenceInTotalSize !== 0)

  const totalSizeChange = tableData.reduce((acc, curr) => {
    return acc + curr.differenceInTotalSize
  }, 0)

  return (
    <div id="RelevantModules">
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Relevant INDIVIDUAL modules that changed total size ({filteredTableData.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1">{totalSizeChange > 0 ? `Build 1 is larger than Build 2 by ${inKB(totalSizeChange)} kb` : `Build 1 is smaller than Build 2 by ${inKB(-1 * totalSizeChange)} kb`} (across all chunks, so pre-gzipped)</Typography>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredTableData}
              columns={tableColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 20 },
                },
              }}
              pageSizeOptions={[10, 20, 50]}
              checkboxSelection
              slots={{
                footer: () => {
                  const totals = {
                    moduleSizeFile1: filteredTableData.reduce((sum, row) => sum + row.moduleSizeFile1, 0),
                    moduleSizeFile2: filteredTableData.reduce((sum, row) => sum + row.moduleSizeFile2, 0),
                    differenceInModuleSize: filteredTableData.reduce((sum, row) => sum + row.differenceInModuleSize, 0),
                    numChunksFile1: filteredTableData.reduce((sum, row) => sum + row.numChunksFile1, 0),
                    numChunksFile2: filteredTableData.reduce((sum, row) => sum + row.numChunksFile2, 0),
                    differenceInNumChunks: filteredTableData.reduce((sum, row) => sum + row.differenceInNumChunks, 0),
                    totalSizeFile1: filteredTableData.reduce((sum, row) => sum + row.totalSizeFile1, 0),
                    totalSizeFile2: filteredTableData.reduce((sum, row) => sum + row.totalSizeFile2, 0),
                    differenceInTotalSize: filteredTableData.reduce((sum, row) => sum + row.differenceInTotalSize, 0),
                  };

                  return (
                    <div style={{ padding: '8px', display: 'flex', borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
                      <div style={{ width: 300, fontWeight: 'bold' }}>Totals</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.moduleSizeFile1)}</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.moduleSizeFile2)}</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.differenceInModuleSize)}</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.numChunksFile1)}</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.numChunksFile2)}</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.differenceInNumChunks)}</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.totalSizeFile1)}</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.totalSizeFile2)}</div>
                      <div style={{ width: 150 }}>{formatNumber(totals.differenceInTotalSize)}</div>
                    </div>
                  );
                },
              }}
            />
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

function AssetComparison(props: { }) {

}