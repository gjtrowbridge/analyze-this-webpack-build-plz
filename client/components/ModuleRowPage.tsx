import { useParams } from 'react-router'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState } from '../globalState'
import { convertToInteger } from '../../server/helpers/misc'
import { useCallback, useState } from 'react'
import { ModuleRow } from './ModuleRow'

export function ModuleRowPage() {
  const params = useParams()
  const moduleDatabaseId = convertToInteger(params.moduleDatabaseId)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const [showRawInfo, setShowRawInfo] = useState<boolean>(false)
  const setShowFinal = useCallback(() => {
    setShowRawInfo(!showRawInfo)
  }, [showRawInfo, setShowRawInfo])

  const stateOrNull = file1ProcessedState.ornull
  if (stateOrNull === null) {
    return <p>Loading information for module id {moduleDatabaseId}...</p>
  }

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
    />
  )
}
