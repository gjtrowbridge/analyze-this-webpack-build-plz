import type { StatsModule } from 'webpack'
import { useCallback, useEffect } from 'react'
import axios from 'axios'
import type { ReactModuleState } from '../types'
import { ModuleRow } from '../../shared/types'
import { useFileIds } from './useFiles'
import { errorsState, modulesStateFile1, modulesStateFile2 } from '../globalState'
import { useHookstate } from '@hookstate/core'


export function useModules() {
  const msf1 = useHookstate(modulesStateFile1)
  const msf2 = useHookstate(modulesStateFile2)
  const fileIds = useFileIds()

  const modulesState1 = msf1.get()
  const setModuleState1 = useCallback((ms: ReactModuleState) => {
    msf1.set(ms)
  }, [])
  const modulesState2 = msf1.get()
  const setModuleState2 = useCallback((ms: ReactModuleState) => {
    msf2.set(ms)
  }, [])

  useUpdateModulesForFile({
    fileId: fileIds.file1,
    alreadyUpToDate: Boolean(modulesState1?.ready),
    setModuleState: setModuleState1,
  })
  useUpdateModulesForFile({
    fileId: fileIds.file2,
    alreadyUpToDate: Boolean(modulesState2?.ready),
    setModuleState: setModuleState2,
  })
}

function useUpdateModulesForFile(args: {
  fileId: number | null
  alreadyUpToDate: boolean
  setModuleState: (rms: ReactModuleState) => void
}) {
  const { fileId, setModuleState, alreadyUpToDate } = args
  const errors = useHookstate(errorsState)
  useEffect(() => {
    if (fileId === null || alreadyUpToDate) {
      return
    }
    console.log('xcxc querying modules for file', fileId)
    let limit = 200
    let minIdNonInclusive = -1
    let shouldStopEarly = false
    const modules: Array<StatsModule> = []
    void (async () => {
      while (!shouldStopEarly) {
        setModuleState({
          ready: false,
          statusMessage: `Getting the ${limit} modules after id: ${minIdNonInclusive} for file: "${fileId}"`,
        })
        try {
          const res = await axios.get<{
            moduleRows: Array<ModuleRow & { id: number }>
            lastId: number | null
          }>(`/api/modules/${fileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
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
        } catch(e) {
          errors.merge("[MODULES]: Something went wrong fetching the list of available modules")
          return
        }
      }
      setModuleState({
        ready: true,
        statusMessage: `Done loading modules for file: "${fileId}"`,
        modules,
      })
    })()

  }, [fileId, setModuleState, alreadyUpToDate])
}

