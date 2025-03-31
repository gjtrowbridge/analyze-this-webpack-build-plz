import { useParams } from 'react-router'
import { convertToInteger } from '../../server/helpers/misc'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState } from '../globalState'
import { useCallback, useState } from 'react'
import { ChunkRow } from './ChunkRow'


export function ChunkRowPage() {
  const params = useParams()
  const chunkDatabaseId = convertToInteger(params.chunkDatabaseId)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const [showRawInfo, setShowRawInfo] = useState<boolean>(false)
  const setShowFinal = useCallback(() => {
    setShowRawInfo(!showRawInfo)
  }, [showRawInfo, setShowRawInfo])

  const stateOrNull = file1ProcessedState.ornull
  if (stateOrNull === null) {
    return <p>Loading information for chunk id {chunkDatabaseId}...</p>
  }

  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get()
  const chunk = chunksByDatabaseId.get(chunkDatabaseId)
  if (!chunk) {
    return <p>No chunk found with id: {chunkDatabaseId}</p>
  }

  return (
    <ChunkRow
      chunk={chunk}
      showRawInfo={showRawInfo}
      setShowRawInfo={setShowFinal}
      chunksByDatabaseId={chunksByDatabaseId}
    />
  )
}
