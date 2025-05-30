import { FileRow } from '../../../shared/types'
import { db } from '../database'
import { Statement } from 'better-sqlite3'
import { DatabaseFileRow } from '../../helpers/databaseTypes'

const deleteAllStatement = `
  DELETE FROM files WHERE id = @id
`

const insertStatement = `
  INSERT INTO files (
                     original_name,
                     user_provided_name,
                     uploaded_at,
                     done_processing,
                     modules_count,
                     chunks_count,
                     assets_count,
                     named_chunk_groups_count
  ) VALUES (
                     @original_name,
                     @user_provided_name,
                     @uploaded_at,
                     @done_processing,
                     @modules_count,
                     @chunks_count,
                     @assets_count,
                     @named_chunk_groups_count
  ) RETURNING id
`
const updateStatement = `
  UPDATE files
  SET
    original_name = @original_name,
    user_provided_name = @user_provided_name,
    uploaded_at = @uploaded_at,
    done_processing = @done_processing,
    modules_count = @modules_count,
    chunks_count = @chunks_count,
    assets_count = @assets_count,
    named_chunk_groups_count = @named_chunk_groups_count
  WHERE
    id = @id
`

const deleteStatement = `
  DELETE FROM files where id = @id
`
const getAllStatement = `
  SELECT * FROM files ORDER BY uploaded_at DESC
`
const getOneStatement = `
  SELECT * FROM files WHERE id = ?
`

export function insertFileToDatabase(fileRow: Omit<DatabaseFileRow, "id">): number {
  const insert: Statement<unknown[], { id: number }> = db.prepare(insertStatement)
  const { id } = insert.get(fileRow)
  return id
}

export function updateFileInDatabase(fileRow: DatabaseFileRow) {
  const update = db.prepare(updateStatement)
  return update.run(fileRow)
}

export function getFilesFromDatabase(): Array<FileRow> {
  const getAll: Statement<unknown[], DatabaseFileRow> = db.prepare(getAllStatement)
  return getAll.all()
}

export function getFileFromDatabase(id: number): FileRow | undefined {
  const getOne: Statement<unknown[], DatabaseFileRow> = db.prepare(getOneStatement)
  return getOne.get(id)
}

export function deleteFileFromDatabase(id: number) {
  const deleteOne: Statement<unknown[], DatabaseFileRow> = db.prepare(deleteStatement)
  return deleteOne.run(id)
}
