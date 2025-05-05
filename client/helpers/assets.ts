import { ImmutableObject } from '@hookstate/core'
import { ProcessedAssetInfo } from './processModulesAndChunks'

export function assetHasChanged(args: {
  asset1: ImmutableObject<ProcessedAssetInfo>
  asset2: ImmutableObject<ProcessedAssetInfo>
}) {
  const { asset1, asset2 } = args
  return asset1.rawFromWebpack.size !== asset2.rawFromWebpack.size
}

export function getAssetName(asset: ImmutableObject<ProcessedAssetInfo>) {
  const rawName = asset.rawFromWebpack.name
  const parts = rawName.split('-')

  // Chop off the last bit after the last "-" symbol
  if (parts.length > 1) {
    parts.pop()
  }
  return parts.join('-')
}