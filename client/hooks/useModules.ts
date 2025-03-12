import type { StatsModule } from 'webpack'
import { useEffect } from 'react'
import axios from 'axios'
import type { ReactModuleState } from '../types'


export function useModules(args: {
  moduleState: ReactModuleState
  selectedFile: string | null,
  setModuleState: (newValue: ReactModuleState) => void
  isEnabled: boolean
  setErrorMessage: (errorMessage: string) => void
}) {
  const { moduleState, selectedFile, setErrorMessage, setModuleState, isEnabled } = args
  useEffect(() => {
    if (selectedFile === null) {
      return
    }
    let offset = 0
    let limit = 200
    let shouldStopEarly = false
    if (moduleState.ready || !isEnabled) {
      return
    }
    console.log(`Querying modules for ${selectedFile}...`)
    const modules: Array<StatsModule> = []
    void (async () => {
      while (!shouldStopEarly) {
        setModuleState({
          ready: false,
          statusMessage: `Getting modules ${offset} -> ${offset + limit - 1} for file: "${selectedFile}"`,
        })
        const res = await axios.get<{ modules?: Array<StatsModule>}>(`/api/modules/${selectedFile}?offset=${offset}&limit=${limit}`)
        if (res.status > 300) {
          setErrorMessage(`Something went wrong when loading the modules...`)
          break
        }
        const modulesFromRequest = res.data.modules || []
        modulesFromRequest.forEach((m) => {
          modules.push(m)
        })
        if (modulesFromRequest.length < limit) {
          break
        }
        offset += limit
        console.log('bumping offset', offset, limit)
      }
      setModuleState({
        ready: true,
        statusMessage: `Done loading modules for file: "${selectedFile}"`,
        modules,
      })
    })()
    return () => { shouldStopEarly = true }
  }, [setErrorMessage, selectedFile, setModuleState, moduleState.ready, isEnabled]);
}
