import { ImmutableObject } from '@hookstate/core'
import { ProcessedAssetInfo } from '../helpers/processModulesAndChunks'
import { Link } from 'react-router'
import { Typography } from '@mui/material'

export function AssetLink(props: {
  asset: ImmutableObject<ProcessedAssetInfo>
  file: 'file1' | 'file2'
  variant?: 'h5' | 'h6' | 'subtitle1' | 'body1'
}) {
  const {
    asset,
    file,
    variant = 'h5'
  } = props

  return (
    <Link to={`/assets/${file}/${asset.assetDatabaseId}`}>
      <Typography variant={variant}>
        {asset.rawFromWebpack.name}
      </Typography>
    </Link>
  )
} 