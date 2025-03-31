import { useParams } from 'react-router'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState, file2ProcessedGlobalState } from '../globalState'
import { convertToInteger } from '../../server/helpers/misc'
import { useCallback, useState } from 'react'
import { ModuleRow } from './ModuleRow'
import { FileNumber } from '../types'

export function ModuleRowPage(props: { file: FileNumber }) {
  const { file } = props
  const params = useParams()
  const moduleDatabaseId = convertToInteger(params.moduleDatabaseId)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)
  const [showRawInfo, setShowRawInfo] = useState<boolean>(false)
  const setShowFinal = useCallback(() => {
    setShowRawInfo(!showRawInfo)
  }, [showRawInfo, setShowRawInfo])

  const stateOrNull = file === "file1" ? file1ProcessedState.ornull : file2ProcessedState.ornull
  if (stateOrNull === null) {
    return <p>Loading information for module id {moduleDatabaseId}...</p>
  }

  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get()
  const modulesByDatabaseId = stateOrNull.modulesByDatabaseId.get()
  const module = modulesByDatabaseId.get(moduleDatabaseId)
  if (!module) {
    return <p>No module found with id: {moduleDatabaseId}</p>
  }

  return (
    <ModuleRow
      module={module}
      showRawInfo={showRawInfo}
      setShowRawInfo={setShowFinal}
      modulesByDatabaseId={modulesByDatabaseId}
      chunksByDatabaseId={chunksByDatabaseId}
    />
  )
}
