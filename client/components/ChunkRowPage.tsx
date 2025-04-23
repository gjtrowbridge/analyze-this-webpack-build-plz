import { useParams } from 'react-router'
import { convertToInteger } from '../../server/helpers/misc'
import { useHookstate } from '@hookstate/core'
import { file1ProcessedGlobalState, file2ProcessedGlobalState } from '../globalState'
import { useCallback, useState } from 'react'
import { ChunkRow } from './ChunkRow'
import { FileNumber } from '../types'


export function ChunkRowPage(props: { file: FileNumber }) {
  const { file } = props
  const params = useParams()
  const chunkDatabaseId = convertToInteger(params.chunkDatabaseId)
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const file2ProcessedState = useHookstate(file2ProcessedGlobalState)
  const [showRawInfo, setShowRawInfo] = useState<boolean>(false)
  const setShowFinal = useCallback(() => {
    setShowRawInfo(!showRawInfo)
  }, [showRawInfo, setShowRawInfo])

  const stateOrNull = file === "file1" ? file1ProcessedState.ornull : file2ProcessedState
  if (stateOrNull === null) {
    return <p>Loading information for chunk id {chunkDatabaseId}...</p>
  }

  const modulesByDatabaseId = stateOrNull.modulesByDatabaseId.get()
  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get()
  const namedChunkGroupsByDatabaseId = stateOrNull.namedChunkGroupsByDatabaseId.get()
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
      modulesByDatabaseId={modulesByDatabaseId}
      namedChunkGroupsByDatabaseId={namedChunkGroupsByDatabaseId}
      noLimitsOnLists={true}
    />
  )
}
