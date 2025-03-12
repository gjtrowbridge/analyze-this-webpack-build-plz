import type { StatsModule } from 'webpack'
import {useCallback, useMemo, useState} from "react"
import { ModuleIdentifier, noDepthFoundConstant, processModules } from "../helpers/modules"
import { ModuleRow } from "./ModuleRow"
import "./styles/ModuleInspector.css"
import { SortControl } from './SortControl'
import { getStatistics } from '../helpers/math'

// TODO: Figure out how to do generics for React elements
// type SortBy = "Name" | "Size" | "Depth" | "# Optimization Bailouts"

const anyInclusionReasonText = "-- Select To Filter --"

export function ModuleInspector(props: {
  modules: Array<StatsModule>
}) {
  const { modules } = props
  const [sortBy, setSortBy] = useState<string>("Name")
  const [sortAscending, setSortAscending] = useState<boolean>(false)
  const [filterName, setFilterName] = useState<string>("")
  const [filterByIdentifier, setFilterByIdentifier] = useState<ModuleIdentifier>("")
  const [filterByChunkId, setFilterByChunkId] = useState<string>("")
  const [filterOptimizationBailout, setfilterOptimizationBailout] = useState<string>("")
  const [showMoreId, setShowMoreId] = useState<ModuleIdentifier>("")
  const [inclusionReasonFilter, setInclusionReasonFilter] = useState<string>(anyInclusionReasonText)

  const { modulesById, extraInfoById, inclusionReasons: irSet } = useMemo(() => {
    return processModules(modules)
  }, modules)
  const inclusionReasons = Array.from(irSet)

  const sortFn = useCallback((a: StatsModule, b: StatsModule) => {
    const sortOrder = sortAscending ? 1 : -1
    const extraA = extraInfoById.get(a.identifier)
    const extraB = extraInfoById.get(b.identifier)
    if (sortBy === "Size") {
      return (a.size - b.size) * sortOrder
    } else if (sortBy === "Depth") {
      return (extraA.depth - extraB.depth) * sortOrder
    } else if (sortBy === "# Optimization Bailouts") {
      const aLength = a.optimizationBailout?.length ?? 0
      const bLength = b.optimizationBailout?.length ?? 0
      return (aLength - bLength) * sortOrder
    } else {
      // Default to "name"
      return (a.name.localeCompare(b.name)) * sortOrder
    }
  }, [sortAscending, sortBy, extraInfoById])

  const finalModules = Array.from(modulesById.values())
  const filteredModules = finalModules
    .filter((m) => {
      if (filterName === "") {
        return true
      }
      return m.name.toLowerCase().includes(filterName.toLowerCase())
    })
    .filter((m) => {
      if (sortBy === "Depth" && extraInfoById.get(m.identifier)?.depth === noDepthFoundConstant) {
        return false
      }
      return true
    })
    .filter((m) => {
      if (filterByChunkId !== "" && !m.chunks.some((chunkId) => { return String(chunkId) === filterByChunkId })) {
        return false
      }
      return true
    })
    .filter((m) => {
      if (filterByIdentifier === "") {
        return true
      }
      return String(m.identifier).toLowerCase().includes(filterByIdentifier.toLowerCase())
    })
    .filter((m) => {
      if (filterOptimizationBailout === "") {
        return true
      }
      return m.optimizationBailout.some((ob) => {
        return ob.toLowerCase().includes(ob.toLowerCase())
      })
    })
    .filter((m) => {
      if (inclusionReasonFilter === anyInclusionReasonText) {
        return true
      }
      if (!m.reasons) {
        return false
      }
      const reasons = m.reasons
      return reasons.some((reason) => {
        return reason.type === inclusionReasonFilter
      })
    })
    .sort(sortFn)
  const moduleRows = filteredModules
    .slice(0, 100)
    .map((m) => {
      return <ModuleRow key={m.identifier} extraInfo={extraInfoById.get(m.identifier)} module={modulesById.get(m.identifier)} setShowRawInfo={(moduleId: ModuleIdentifier) => {
        setShowMoreId(moduleId)
      }} showRawInfo={showMoreId === String(m.identifier)} />
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
  } = getStatistics(filteredModules.map((m) => { return m.size }))

  const noModuleWarning = modules.length > 0 ? null : <h2 className="warning">No modules found -- Make sure you generate your stats.json file with module output enabled!</h2>

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
      <h2>There are {modules.length} total modules, and {filteredModules.length} modules that passed your filters</h2>
      {noModuleWarning}
      <h3>For the ones passing filters, the mean module size is {Math.round(mean / 1024)} kb, the std deviation is {Math.round(standardDeviation / 1024)} kb</h3>
      <div className="rows">
        {moduleRows}
      </div>
    </div>
  )
}
