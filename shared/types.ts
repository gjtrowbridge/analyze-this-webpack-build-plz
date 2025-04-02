import { StatsChunk, StatsModule } from 'webpack'

export interface FileRow {
  id: number
  original_name: string
  user_provided_name: string
  uploaded_at: number
  done_processing: number
}
export interface ModuleRow {
  databaseId: number
  rawFromWebpack: StatsModule
  fileId: number
}
export interface ChunkRow {
  databaseId: number
  rawFromWebpack: StatsChunk
  fileId: number
}
