import {useCallback, useState} from "react"
import { ModuleRow } from "./ModuleRow"
import "./styles/ModuleInspector.css"
import { SortControl } from './SortControl'
import { getStatistics } from '../helpers/math'
import { ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState } from '../globalState'

// TODO: Figure out how to do generics for React elements
// type SortBy = "Name" | "Size" | "Depth" | "# Optimization Bailouts"

const anyInclusionReasonText = "-- Select To Filter --"

export function ModuleInspector() {
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const [sortBy, setSortBy] = useState<string>("Name")
  const [sortAscending, setSortAscending] = useState<boolean>(false)
  const [filterName, setFilterName] = useState<string>("")
  const [filterByIdentifier, setFilterByIdentifier] = useState<string>("")
  const [filterByChunkId, setFilterByChunkId] = useState<string>("")
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
    } else {
      // Default to "name"
      return (a.rawFromWebpack.name.localeCompare(b.rawFromWebpack.name)) * sortOrder
    }
  }, [sortAscending, sortBy])

  const stateOrNull = file1ProcessedState.ornull
  if (stateOrNull === null) {
    return <p>Loading and processing data, module data will be visible soon...</p>
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
      <option key={reasonType} value={reasonType}>{reasonType}</option>
    )
  })
  inclusionReasonOptions.unshift(<option key={anyInclusionReasonText} value={anyInclusionReasonText}>{anyInclusionReasonText}</option>)

  const {
    mean,
    standardDeviation,
  } = getStatistics(filteredModules.map((m) => { return m.rawFromWebpack.size }))

  const noModuleWarning = finalModules.length > 0 ? null : <h2 className="warning">No modules found -- Make sure you generate your stats.json file with module output enabled!</h2>

  return (
    <div className="moduleInspector">
      <div className={"inspectorControls"}>
        <div className={"sorts"}>Sort by:
          <SortControl controlFor={"Name"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
          <SortControl controlFor={"Size"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
          <SortControl controlFor={"Depth"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
          <SortControl controlFor={"# Optimization Bailouts"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
        </div>
        <div className={"filters"}>
          <label>Filter By Name:<input onChange={(e) => {
            setFilterName(e.target.value)
          }} value={filterName} /></label>
          <label>Filter By Module Identifier:<input onChange={(e) => {
            setFilterByIdentifier(e.target.value)
          }} value={filterByIdentifier} /></label>
          <label>Filter By Chunk Id:<input onChange={(e) => {
            setFilterByChunkId(e.target.value)
          }} value={filterByChunkId} /></label>
          <label>Filter By Optimization Bailout Reason:<input onChange={(e) => {
            setfilterOptimizationBailout(e.target.value)
          }} value={filterOptimizationBailout} /></label>
          <label>
            Filter By Inclusion Reason:
            <select
              name="bailout-reason-filter"
              value={inclusionReasonFilter}
              onChange={(e) => {
                setInclusionReasonFilter(e.target.value)
              }}
            >
              {inclusionReasonOptions}
            </select>
          </label>
        </div>
      </div>
      <h2>There are {finalModules.length} total modules, and {filteredModules.length} modules that passed your filters</h2>
      {noModuleWarning}
      <h3>For the ones passing filters, the mean module size is {Math.round(mean / 1024)} kb, the std deviation is {Math.round(standardDeviation / 1024)} kb</h3>
      <div className="rows">
        {moduleRows}
      </div>
    </div>
  )
}
