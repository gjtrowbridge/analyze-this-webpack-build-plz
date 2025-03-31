import { ChunkRow } from './ChunkRow'
import { useCallback, useState } from 'react'
import { ChunkIdentifier } from '../helpers/chunks'
import { SortControl } from './SortControl'
import { getStatistics } from '../helpers/math'
import { useHookstate } from '@hookstate/core'
import { ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { file1ProcessedGlobalState } from '../globalState'

type SortBy = "Size" | "Name"

export function ChunkInspector() {
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const [filterById, setFilterById] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("Size")
  const [sortAscending, setSortAscending] = useState<boolean>(false)
  const [showMoreId, setShowMoreId] = useState<ChunkIdentifier>("")
  const [filterName, setFilterName] = useState<string>("")
  const [filterByIncludedModule, setFilterByIncludedModule] = useState<string>("")
  const [filterByGeneratedAssetName, setFilterByGeneratedAssetName] = useState<string>("")

  const sortFn = useCallback((a: ProcessedChunkInfo, b: ProcessedChunkInfo) => {
    const sortOrder = sortAscending ? 1 : -1
    if (sortBy === "Size") {
      return (a.rawFromWebpack.size - b.rawFromWebpack.size) * sortOrder
    } else {
      const aName = a.rawFromWebpack.names?.join("|") || ""
      const bName = b.rawFromWebpack.names?.join("|") || ""
      // Default to "name"
      return (aName.localeCompare(bName)) * sortOrder
    }
  }, [sortAscending, sortBy])

  const stateOrNull = file1ProcessedState.ornull
  if (stateOrNull === null) {
    return <p>Loading and processing data, chunk data will be visible soon...</p>
  }

  const modulesByDatabaseId = stateOrNull.modulesByDatabaseId.get()
  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get()
  const chunks = Array.from(chunksByDatabaseId.values())
  const chunkRows = chunks
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
    .slice(0, 100)
    .map((chunk) => {
      return <ChunkRow
        setShowRawInfo={(chunkDatabaseId) => {
          setShowMoreId(chunkDatabaseId)
        }}
        showRawInfo={showMoreId === chunk.chunkDatabaseId}
        key={chunk.chunkDatabaseId}
        chunk={chunk}
        modulesByDatabaseId={modulesByDatabaseId}
        chunksByDatabaseId={chunksByDatabaseId}
      />
    })

  const {
    mean,
    standardDeviation,
  } = getStatistics(chunks.map((c) => { return c.rawFromWebpack.size }))

  const noChunkWarning = chunks.length > 0 ? null : <h2 className="warning">No chunks found -- Make sure you generate your stats.json with chunk output enabled!</h2>

  return (
    <div className="ChunkInspector">
      <div className={"inspectorControls"}>
        <div className={"sorts"}>Sort by:
          <SortControl controlFor={"Name"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
          <SortControl controlFor={"Size"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
        </div>
        <div className={"filters"}>
          <label>Filter By Id:<input onChange={(e) => {
            setFilterById(e.target.value)
          }} value={filterById} /></label>
          <label>Filter By Name:<input onChange={(e) => {
            setFilterName(e.target.value)
          }} value={filterName} /></label>
          <label>Filter By Included Modules:<input onChange={(e) => {
            setFilterByIncludedModule(e.target.value)
          }} value={filterByIncludedModule} /></label>
          <label>Filter By Generated Asset Name:<input onChange={(e) => {
            setFilterByGeneratedAssetName(e.target.value)
          }} value={filterByGeneratedAssetName} /></label>
        </div>
      </div>
      <h2>There are {chunks.length} chunks</h2>
      {noChunkWarning}
      <h3>The mean chunk size is {Math.round(mean / 1024)} kb, the std deviation is {Math.round(standardDeviation / 1024)} kb</h3>
      <div className="rows">
        {chunkRows}
      </div>
    </div>
  )
}