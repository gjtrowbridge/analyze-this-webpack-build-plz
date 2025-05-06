import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { ProcessedAssetInfo, ProcessedModuleInfo } from './processModulesAndChunks'

export function getAssetSize(asset: ImmutableObject<ProcessedAssetInfo>) {
  return asset.rawFromWebpack.size
}

export function assetHasChanged(args: {
  asset1: ImmutableObject<ProcessedAssetInfo>
  asset2: ImmutableObject<ProcessedAssetInfo>
}) {
  const { asset1, asset2 } = args
  return getAssetSize(asset1) !== getAssetSize(asset2)
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

export class AssetLookup {

  private byDatabaseId: Map<number, ImmutableObject<ProcessedAssetInfo>>
  private byName: Map<string, Array<ImmutableObject<ProcessedAssetInfo>>>

  constructor() {
    this.byDatabaseId = new Map<number, ProcessedAssetInfo>
    this.byName = new Map<string, Array<ImmutableObject<ProcessedAssetInfo>>>
  }

  addAsset(asset: ImmutableObject<ProcessedAssetInfo>): void {
    if (this.byDatabaseId.has(asset.assetDatabaseId)) {
      // Do nothing, this has already been added to the lookup
      return
    }

    // Add to the name lookup
    const name = getAssetName(asset)
    let arr = this.byName.get(name) ?? []
    arr.push(asset)
    this.byName.set(name, arr)

    // Add to the database id lookup
    this.byDatabaseId.set(asset.assetDatabaseId, asset)
  }

  /**
   * This method is useful when we know database id will not match.  For example, when we
   * are comparing assets from file1 vs assets from file2, we know the database ids won't match because
   * they will be different underlying records in the database. So we have to look it up via name or some
   * other method.
   */
  getMatchingAssetFromOtherFile(args: {
    // Both of these properties should be for a specific file
    asset: ImmutableObject<ProcessedAssetInfo>
    modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>,
  }): ImmutableObject<ProcessedAssetInfo> | undefined {
    const { asset, modulesByDatabaseId } = args
    const name = getAssetName(asset)
    const arr = this.byName.get(name) ?? []
    if (arr.length === 0) {
      return undefined
    }
    for (const assetWithSameName of arr) {
      // If we find an asset that looks identical, then we assume that's the match we're looking for
      if (!assetHasChanged({
        asset1: asset,
        asset2: assetWithSameName
      })) {
        return assetWithSameName
      }

      // TODO: Add more checks, eg check asset contents, etc
    }

    return arr[0]
  }

  getByDatabaseId(databaseId: number): ImmutableObject<ProcessedAssetInfo> | undefined {
    return this.byDatabaseId.get(databaseId)
  }

  toArray(): Array<ImmutableObject<ProcessedAssetInfo>> {
    return Array.from(this.byDatabaseId.values())
  }
}

export function getSumOfSizes(assets: Array<ImmutableObject<ProcessedAssetInfo>>): number {
  return assets.reduce((acc, asset) => {
    return getAssetSize(asset) + acc
  }, 0)
}