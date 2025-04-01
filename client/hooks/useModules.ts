import { useCallback, useEffect } from 'react'
import axios from 'axios'
import { ModuleRow } from '../../shared/types'
import { useFileIds } from './useFiles'
import {
  errorsState,
  file1ModulesGlobalState,
  file2ModulesGlobalState,
} from '../globalState'
import { ImmutableObject, useHookstate } from '@hookstate/core'


export function useModules() {
  const modules1 = useHookstate(file1ModulesGlobalState)
  const modules2 = useHookstate(file2ModulesGlobalState)
  const fileIds = useFileIds()

  const modulesState1 = modules1.get()
  const setModuleState1 = useCallback((ms: ImmutableObject<{
    ready: boolean,
    modules: Array<ModuleRow>
  }>) => {
    modules1.set(ms)
  }, [])
  const modulesState2 = modules2.get()
  const setModuleState2 = useCallback((ms: ImmutableObject<{
    ready: boolean,
    modules: Array<ModuleRow>
  }>) => {
    modules2.set(ms)
  }, [])

  useUpdateModulesForFile({
    fileId: fileIds.file1,
    alreadyUpToDate: Boolean(modulesState1.ready),
    setModuleState: setModuleState1,
  })
  useUpdateModulesForFile({
    fileId: fileIds.file2,
    alreadyUpToDate: Boolean(modulesState2.ready),
    setModuleState: setModuleState2,
  })
}

function useUpdateModulesForFile(args: {
  fileId: number | null
  alreadyUpToDate: boolean
  setModuleState: (ms: ImmutableObject<{
    ready: boolean,
    modules: Array<ModuleRow>
  }>) => void
}) {
  const { fileId, setModuleState, alreadyUpToDate } = args
  const errors = useHookstate(errorsState)
  useEffect(() => {
    if (fileId === null || alreadyUpToDate) {
      return
    }
    let limit = 50
    let minIdNonInclusive = -1
    let shouldStopEarly = false
    const modules: Array<ModuleRow> = []
    void (async () => {
      while (!shouldStopEarly) {
        try {
          const res = await axios.get<{
            moduleRows: Array<ModuleRow>
            lastId: number | null
          }>(`/api/modules/${fileId}?minIdNonInclusive=${minIdNonInclusive}&limit=${limit}`)
          const { moduleRows, lastId } = res.data
          moduleRows.forEach((mr) => {
            modules.push(mr)
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
        modules,
      })
    })()

  }, [fileId, setModuleState, alreadyUpToDate])
}

