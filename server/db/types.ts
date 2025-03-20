import type { Database } from 'better-sqlite3'

export interface FileRow {
  id?: number
  original_name: string
  user_provided_name: string
  uploaded_at: number
  done_processing: number
}
export interface ModuleRow {
  id?: number
  module_id: string
  module_identifier: string
  raw: object
  file_id: number
}
export interface ChunkRow {
  id?: number
  chunk_id: string
  chunk_name: string
  raw: object
  file_id: number
}
