import { ChunkRow } from './ChunkRow'
import { useCallback, useState } from 'react'
import { ChunkIdentifier } from '../helpers/chunks'
import { SortControl } from './SortControl'
import { getStatistics, inKB } from '../helpers/math'
import { useHookstate } from '@hookstate/core'
import { ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { file1ProcessedGlobalState } from '../globalState'
import { ChunkSortBy } from '../types'
import { unreachable } from '../../shared/helpers'
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Paper, 
  TextField, 
  Typography,
  Alert
} from '@mui/material'

export function ChunkInspector() {
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const [filterById, setFilterById] = useState<string>("")
  const [sortBy, setSortBy] = useState<ChunkSortBy>("Javascript Size")
  const [sortAscending, setSortAscending] = useState<boolean>(false)
  const [showMoreId, setShowMoreId] = useState<ChunkIdentifier>("")
  const [filterName, setFilterName] = useState<string>("")
  const [filterByIncludedModule, setFilterByIncludedModule] = useState<string>("")
  const [filterByGeneratedAssetName, setFilterByGeneratedAssetName] = useState<string>("")

  const sortFn = useCallback((a: ProcessedChunkInfo, b: ProcessedChunkInfo) => {
    const sortOrder = sortAscending ? 1 : -1
    if (sortBy === 'Javascript Size') {
      return ((a.rawFromWebpack.sizes.javascript ?? 0) - (b.rawFromWebpack.sizes.javascript ?? 0)) * sortOrder
    } else if (sortBy === 'Name') {
      const aName = a.rawFromWebpack.names?.join("|") || ""
      const bName = b.rawFromWebpack.names?.join("|") || ""
      return (aName.localeCompare(bName)) * sortOrder
    } else if (sortBy === '# JS Assets') {
      const aJsAssets = a.rawFromWebpack.files?.filter((f) => {
        return f.toLowerCase().includes('.js')
      }).length ?? 0
      const bJsAssets = a.rawFromWebpack.files?.filter((f) => {
        return f.toLowerCase().includes('.js')
      }).length ?? 0
      return (aJsAssets - bJsAssets) * sortOrder
    } else if (sortBy === 'Depth From Entry') {
      const depthA = a.pathFromEntry.length
      const depthB = b.pathFromEntry.length
      return (depthA - depthB) * sortOrder
    } else {
      unreachable(sortBy)
    }
  }, [sortAscending, sortBy])

  const stateOrNull = file1ProcessedState.ornull
  if (stateOrNull === null) {
    return <Typography>Loading and processing data, chunk data will be visible soon...</Typography>
  }

  const modulesByDatabaseId = stateOrNull.modulesByDatabaseId.get()
  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get()
  const namedChunkGroupsByDatabaseId = stateOrNull.namedChunkGroupsByDatabaseId.get()
  const chunks = Array.from(chunksByDatabaseId.values())
  const chunkRows = chunks
    .filter((c) => {
      if (sortBy === 'Depth From Entry' && c.pathFromEntry.length === 0) {
        return false
      }
      return true
    })
    .filter((c) => {
      if (filterName === "") {
        return true
      }
      return c.rawFromWebpack.names.some((name) => {
        return name.toLowerCase().includes(filterName.toLowerCase())
      })
    })
    .filter((c) => {
      if (filterById === "") {
        return true
      }
      return String(c.rawFromWebpack.id) === String(filterById)
    })
    .filter((c) => {
      if (filterByIncludedModule === "") {
        return true
      }
      return c.rawFromWebpack.origins.some((o) => {
        return o.moduleIdentifier.toLowerCase().includes(filterByIncludedModule.toLowerCase())
      })
    })
    .filter((c) => {
      if (filterByGeneratedAssetName === "") {
        return true
      }
      return c.rawFromWebpack.files.some((f) => {
        return f.toLowerCase().includes(filterByGeneratedAssetName.toLowerCase())
      })
    })
    .sort(sortFn)
    .slice(0, 50)
    .map((chunk) => {
      return <ChunkRow
        file={'file1'}
        setShowRawInfo={(chunkDatabaseId) => {
          setShowMoreId(chunkDatabaseId)
        }}
        showRawInfo={showMoreId === chunk.chunkDatabaseId}
        key={chunk.chunkDatabaseId}
        chunk={chunk}
        modulesByDatabaseId={modulesByDatabaseId}
        chunksByDatabaseId={chunksByDatabaseId}
        namedChunkGroupsByDatabaseId={namedChunkGroupsByDatabaseId}
      />
    })

  const {
    mean,
    standardDeviation,
  } = getStatistics(chunks.map((c) => { return c.rawFromWebpack.size }))

  const noChunkWarning = chunks.length > 0 ? null : (
    <Alert severity="warning" sx={{ mb: 2 }}>
      No chunks found -- Make sure you generate your stats.json with chunk output enabled!
    </Alert>
  )

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Sort by:</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <SortControl<ChunkSortBy> controlFor={"Name"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<ChunkSortBy> controlFor={"Javascript Size"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<ChunkSortBy> controlFor={"# JS Assets"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<ChunkSortBy> controlFor={"Depth From Entry"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Filter By Id"
                value={filterById}
                onChange={(e) => setFilterById(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Filter By Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Filter By Included Modules"
                value={filterByIncludedModule}
                onChange={(e) => setFilterByIncludedModule(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Filter By Generated Asset Name"
                value={filterByGeneratedAssetName}
                onChange={(e) => setFilterByGeneratedAssetName(e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        There are {chunks.length} chunks
      </Typography>
      {noChunkWarning}
      <Typography variant="subtitle1" gutterBottom>
        The mean chunk size is {inKB(mean)}, the std deviation is {inKB(standardDeviation)}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {chunkRows}
      </Box>
    </Box>
  )
}