import type { StatsModule } from 'webpack'
import { useEffect } from 'react'
import axios from 'axios'
import type { ReactModuleState } from '../types'
import { ModuleRow } from '../../shared/types'


export function useModules(args: {
  moduleState: ReactModuleState
  selectedFileId: number | null,
  setModuleState: (newValue: ReactModuleState) => void
  isEnabled: boolean
  setErrorMessage: (errorMessage: string) => void
}) {
  const { moduleState, selectedFileId, setErrorMessage, setModuleState, isEnabled } = args
  useEffect(() => {
    if (selectedFileId === null) {
      return
    }
    let limit = 200
    let minIdNonInclusive = -1
    let shouldStopEarly = false
    if (moduleState.ready || !isEnabled) {
      return
    }
    console.log(`Querying modules for ${selectedFileId}...`)
    const modules: Array<StatsModule> = []
    void (async () => {
      while (!shouldStopEarly) {
        setModuleState({
          ready: false,
          statusMessage: `Getting the ${limit} modules after id: ${minIdNonInclusive} for file: "${selectedFileId}"`,
        })
        const res = await axios.get<{
          moduleRows: Array<ModuleRow & { id: number }>
          lastId: number | null
        }>(`/api/modules/${selectedFileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
        if (res.status > 300) {
          setErrorMessage(`Something went wrong when loading the modules...`)
          break
        }
        const { moduleRows, lastId } = res.data
        moduleRows.forEach((mr) => {
          const module: StatsModule = JSON.parse(mr.raw_json)
          modules.push(module)
        })
        if (lastId === null) {
          break
        }
        minIdNonInclusive = lastId
        console.log('last module id...', lastId)
      }
      setModuleState({
        ready: true,
        statusMessage: `Done loading modules for file: "${selectedFileId}"`,
        modules,
      })
    })()
    return () => { shouldStopEarly = true }
  }, [setErrorMessage, selectedFileId, setModuleState, moduleState.ready, isEnabled]);
}
