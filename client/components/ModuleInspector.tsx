import {useCallback, useState} from "react"
import { ModuleRow } from "./ModuleRow"
import { SortControl } from './SortControl'
import { getStatistics } from '../helpers/math'
import { ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState } from '../globalState'
import { ModuleSortBy } from '../types'
import { unreachable } from '../../shared/helpers'
import { convertToInteger } from '../../server/helpers/misc'
import { getModuleExtraSizeDueToDuplication, getModuleNumberOfChunks } from '../helpers/modules'
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'

// TODO: Figure out how to do generics for React elements
const anyInclusionReasonText = "-- Select To Filter --"

export function ModuleInspector() {
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const [sortBy, setSortBy] = useState<ModuleSortBy>("Name")
  const [sortAscending, setSortAscending] = useState<boolean>(false)
  const [filterName, setFilterName] = useState<string>("")
  const [filterByIdentifier, setFilterByIdentifier] = useState<string>("")
  const [filterByChunkId, setFilterByChunkId] = useState<string>("")
  const [filterByMinNumberChunks, setFilterByMinNumberChunks] = useState<number>(0)
  const [filterOptimizationBailout, setfilterOptimizationBailout] = useState<string>("")
  const [showMoreId, setShowMoreId] = useState<number>(-1)
  const [inclusionReasonFilter, setInclusionReasonFilter] = useState<string>(anyInclusionReasonText)

  const sortFn = useCallback((a: ProcessedModuleInfo, b: ProcessedModuleInfo) => {
    const sortOrder = sortAscending ? 1 : -1
    const depthA = a.pathFromEntry.length
    const depthB = b.pathFromEntry.length
    if (sortBy === "Size") {
      return (a.rawFromWebpack.size - b.rawFromWebpack.size) * sortOrder
    } else if (sortBy === "Depth") {
      return (depthA - depthB) * sortOrder
    } else if (sortBy === "# Optimization Bailouts") {
      const aLength = a.rawFromWebpack.optimizationBailout?.length ?? 0
      const bLength = b.rawFromWebpack.optimizationBailout?.length ?? 0
      return (aLength - bLength) * sortOrder
    } else if (sortBy === 'Name') {
      return (a.rawFromWebpack.name.localeCompare(b.rawFromWebpack.name)) * sortOrder
    } else if (sortBy === '# Chunks') {
      const aNumChunks = getModuleNumberOfChunks(a)
      const bNumChunks = getModuleNumberOfChunks(b)
      return (aNumChunks - bNumChunks) * sortOrder
    } else if (sortBy === 'Extra Duplication Size') {
      const aExtra = getModuleExtraSizeDueToDuplication(a)
      const bExtra = getModuleExtraSizeDueToDuplication(b)
      return (aExtra - bExtra) * sortOrder
    } else {
      unreachable(sortBy)
    }
  }, [sortAscending, sortBy])

  const stateOrNull = file1ProcessedState.ornull
  if (stateOrNull === null) {
    return <Typography>Loading and processing data, module data will be visible soon...</Typography>
  }

  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get()
  const modulesByDatabaseId = stateOrNull.modulesByDatabaseId.get()
  const moduleInclusionReasons = stateOrNull.moduleInclusionReasons.get()
  const inclusionReasons = Array.from(moduleInclusionReasons)
  const finalModules = Array.from(modulesByDatabaseId.values())
  const filteredModules = finalModules
    .filter((m) => {
      if (filterName === "") {
        return true
      }
      return m.rawFromWebpack.name.toLowerCase().includes(filterName.toLowerCase())
    })
    .filter((m) => {
      if (sortBy === "Depth" && m.pathFromEntry.length === 0) {
        return false
      }
      return true
    })
    .filter((m) => {
      if (filterByChunkId !== "" && !m.rawFromWebpack.chunks.some((chunkId) => {
        return String(chunkId) === filterByChunkId
      })) {
        return false
      }
      return true
    })
    .filter((m) => {
      if (filterByIdentifier === "") {
        return true
      }
      return String(m.rawFromWebpack.identifier).toLowerCase().includes(filterByIdentifier.toLowerCase())
    })
    .filter((m) => {
      if (filterOptimizationBailout === "") {
        return true
      }
      return m.rawFromWebpack.optimizationBailout.some((ob) => {
        return ob.toLowerCase().includes(ob.toLowerCase())
      })
    })
    .filter((m) => {
      if (inclusionReasonFilter === anyInclusionReasonText) {
        return true
      }
      if (!m.rawFromWebpack.reasons) {
        return false
      }
      const reasons = m.rawFromWebpack.reasons
      return reasons.some((reason) => {
        return reason.type === inclusionReasonFilter
      })
    })
    .filter((m) => {
      const numChunks = getModuleNumberOfChunks(m)
      if (numChunks >= filterByMinNumberChunks) {
        return true
      }
    })
    .sort(sortFn)
  const moduleRows = filteredModules
    .slice(0, 100)
    .map((m) => {
      return <ModuleRow
        key={m.moduleDatabaseId}
        module={m}
        setShowRawInfo={(moduleDatabaseId: number) => {
          setShowMoreId(moduleDatabaseId)
        }}
        showRawInfo={showMoreId === m.moduleDatabaseId}
        modulesByDatabaseId={modulesByDatabaseId}
        chunksByDatabaseId={chunksByDatabaseId}
      />
    })

  const inclusionReasonOptions = inclusionReasons.map((reasonType) => {
    return (
      <MenuItem key={reasonType} value={reasonType}>{reasonType}</MenuItem>
    )
  })
  inclusionReasonOptions.unshift(<MenuItem key={anyInclusionReasonText} value={anyInclusionReasonText}>{anyInclusionReasonText}</MenuItem>)

  const {
    mean,
    standardDeviation,
  } = getStatistics(filteredModules.map((m) => { return m.rawFromWebpack.size }))

  const noModuleWarning = finalModules.length > 0 ? null : (
    <Alert severity="warning" sx={{ mb: 2 }}>
      No modules found -- Make sure you generate your stats.json file with module output enabled!
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
                <SortControl<ModuleSortBy> controlFor={"Name"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<ModuleSortBy> controlFor={"Size"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<ModuleSortBy> controlFor={"Depth"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<ModuleSortBy> controlFor={"# Optimization Bailouts"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<ModuleSortBy> controlFor={"# Chunks"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<ModuleSortBy> controlFor={"Extra Duplication Size"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
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
                label="Filter By Module Identifier"
                value={filterByIdentifier}
                onChange={(e) => setFilterByIdentifier(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Filter By Webpack Chunk Id"
                value={filterByChunkId}
                onChange={(e) => setFilterByChunkId(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Filter By Min Chunks"
                type="number"
                value={filterByMinNumberChunks}
                onChange={(e) => setFilterByMinNumberChunks(convertToInteger(e.target.value))}
                size="small"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Filter By Optimization Bailout Reason"
                value={filterOptimizationBailout}
                onChange={(e) => setfilterOptimizationBailout(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter By Inclusion Reason</InputLabel>
                <Select
                  value={inclusionReasonFilter}
                  onChange={(e) => setInclusionReasonFilter(e.target.value)}
                  label="Filter By Inclusion Reason"
                >
                  {inclusionReasonOptions}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        There are {finalModules.length} total modules, and {filteredModules.length} modules that passed your filters
      </Typography>
      {noModuleWarning}
      <Typography variant="subtitle1" gutterBottom>
        For the ones passing filters, the mean module size is {Math.round(mean / 1024)} kb, the std deviation is {Math.round(standardDeviation / 1024)} kb
      </Typography>
      <Box sx={{ mt: 2 }}>
        {moduleRows}
      </Box>
    </Box>
  )
}
