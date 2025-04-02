import { ChunkRow, FileRow, ModuleRow } from '../../shared/types'

export type DatabaseFileRow = FileRow

export interface DatabaseModuleRow {
  id: number
  unique_key: string
  module_id: string
  module_identifier: string
  raw_json: string
  file_id: number
}

export interface DatabaseChunkRow {
  id: number
  chunk_id: string
  chunk_name: string
  raw_json: string
  file_id: number
}

export function convertToSharedModuleType(dbRow: DatabaseModuleRow): ModuleRow {
  return {
    databaseId: dbRow.id,
    rawFromWebpack: JSON.parse(dbRow.raw_json),
    fileId: dbRow.file_id,
  }
}

export function convertToSharedChunkType(dbRow: DatabaseChunkRow): ChunkRow {
  return {
    databaseId: dbRow.id,
    rawFromWebpack: JSON.parse(dbRow.raw_json),
    fileId: dbRow.file_id
  }
}
