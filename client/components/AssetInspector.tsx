import { useCallback, useState } from 'react'
import { AssetRow } from './AssetRow'
import { SortControl } from './SortControl'
import { getHumanReadableSize, getStatistics, inKB } from '../helpers/math'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState } from '../globalState'
import { ProcessedAssetInfo } from '../helpers/processModulesAndChunks'
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  Typography,
  Alert
} from '@mui/material'
import { getAssetSize, getSumOfSizes } from '../helpers/assets'

export type AssetSortBy = 'Name' | 'Size' | 'Total Modules'

export function AssetInspector() {
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const [sortBy, setSortBy] = useState<AssetSortBy>("Name")
  const [sortAscending, setSortAscending] = useState<boolean>(false)
  const [filterName, setFilterName] = useState<string>("")
  const [filterByNamedChunkGroup, setFilterByNamedChunkGroup] = useState<string>("")
  const [showMoreId, setShowMoreId] = useState<number>(-1)

  const sortFn = useCallback((a: ProcessedAssetInfo, b: ProcessedAssetInfo) => {
    const sortOrder = sortAscending ? 1 : -1
    if (sortBy === "Size") {
      return (a.rawFromWebpack.size - b.rawFromWebpack.size) * sortOrder
    } else if (sortBy === "Name") {
      return (a.rawFromWebpack.name.localeCompare(b.rawFromWebpack.name)) * sortOrder
    } else if (sortBy === "Total Modules") {
      const aTotalModules = a.moduleDatabaseIds.size + a.subModuleDatabaseIds.size
      const bTotalModules = b.moduleDatabaseIds.size + b.subModuleDatabaseIds.size
      return (aTotalModules - bTotalModules) * sortOrder
    }
    return 0
  }, [sortAscending, sortBy])

  const stateOrNull = file1ProcessedState.ornull
  if (stateOrNull === null) {
    return <Typography>Loading and processing data, asset data will be visible soon...</Typography>
  }

  const assetLookup = stateOrNull.assetLookup.get()
  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get()
  const modulesByDatabaseId = stateOrNull.modulesByDatabaseId.get()
  const namedChunkGroupsByDatabaseId = stateOrNull.namedChunkGroupsByDatabaseId.get()
  const allAssets = assetLookup.toArray()
  const exactNames = filterByNamedChunkGroup.split(',').map(name => name.trim().toLowerCase())
  const filteredAssets = allAssets
    .filter((a) => {
      if (filterName === "") {
        return true
      }
      return a.rawFromWebpack.name.toLowerCase().includes(filterName.toLowerCase())
    })
    .filter((a) => {
      if (filterByNamedChunkGroup === "") {
        return true
      }
      return Array.from(a.namedChunkGroupDatabaseIds).some((ncgId) => {
        const ncg = namedChunkGroupsByDatabaseId.get(ncgId)
        return ncg && exactNames.includes(ncg.name.toLowerCase())
      })
    })
    .sort(sortFn)
  const assetRows = filteredAssets.slice(0, 50).map((asset) => {
    return <AssetRow
      key={asset.assetDatabaseId}
      file={'file1'}
      asset={asset}
      setShowRawInfo={(assetDatabaseId) => {
        setShowMoreId(assetDatabaseId)
      }}
      showRawInfo={showMoreId === asset.assetDatabaseId}
      chunksByDatabaseId={chunksByDatabaseId}
      modulesByDatabaseId={modulesByDatabaseId}
    />
  })

  const {
    mean,
    standardDeviation,
  } = getStatistics(filteredAssets.map((a) => { return a.rawFromWebpack.size }))

  const totalSize = getSumOfSizes(allAssets)
  const totalSizeFiltered = getSumOfSizes(filteredAssets)

  const noAssetWarning = allAssets.length > 0 ? null : (
    <Alert severity="warning" sx={{ mb: 2 }}>
      No assets found -- Make sure you generate your stats.json with asset output enabled!
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
                <SortControl<AssetSortBy> controlFor={"Name"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<AssetSortBy> controlFor={"Size"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<AssetSortBy> controlFor={"Total Modules"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Filter By Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Filter By Named Chunk Group (comma-separated, exact match)"
                value={filterByNamedChunkGroup}
                onChange={(e) => setFilterByNamedChunkGroup(e.target.value)}
                size="small"
                placeholder="e.g. main, vendor, app"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        There are {allAssets.length} total assets, {filteredAssets.length} assets that pass your filters, and {assetRows.length} being shown
      </Typography>
      <Typography variant="h6" gutterBottom>
        The total size of all assets is {getHumanReadableSize(totalSize)}, and the total size of assets that pass filters is {getHumanReadableSize(totalSizeFiltered)}
      </Typography>
      {noAssetWarning}
      <Typography variant="subtitle1" gutterBottom>
        For the filtered assets, the mean asset size is {getHumanReadableSize(mean)}, the std deviation is {getHumanReadableSize(standardDeviation)}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {assetRows}
      </Box>
    </Box>
  )
} 