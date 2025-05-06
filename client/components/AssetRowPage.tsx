import { useHookstate } from '@hookstate/core'
import { useParams } from 'react-router'
import { file1ProcessedGlobalState } from '../globalState'
import { AssetRow } from './AssetRow'
import { Box } from '@mui/material'
import { ProcessedAssetInfo, ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { ImmutableObject, ImmutableMap } from '@hookstate/core'

interface AssetRowPageProps {
  file: 'file1' | 'file2'
}

export function AssetRowPage({ file }: AssetRowPageProps) {
  const { assetDatabaseId } = useParams()
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState)
  const stateOrNull = file1ProcessedState.ornull

  if (stateOrNull === null) {
    return <Box>Loading and processing data, asset data will be visible soon...</Box>
  }

  const assetId = Number(assetDatabaseId)
  const assetLookup = stateOrNull.assetLookup.get()
  const asset = assetLookup.getByDatabaseId(assetId)
  if (!asset) {
    return <Box>Asset not found</Box>
  }

  return (
    <Box sx={{ p: 2 }}>
      <AssetRow
        file={file}
        asset={asset}
        showRawInfo={true}
        setShowRawInfo={() => {}}
        chunksByDatabaseId={stateOrNull.chunksByDatabaseId.get()}
        modulesByDatabaseId={stateOrNull.modulesByDatabaseId.get()}
      />
    </Box>
  )
} 