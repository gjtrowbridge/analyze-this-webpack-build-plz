import { FileRow } from '../types'
import { db } from '../database'
import { Statement } from 'better-sqlite3'

const insertStatement = `
  INSERT INTO files (
                     original_name,
                     user_provided_name,
                     uploaded_at,
                     done_processing
  ) VALUES (
                     @original_name,
                     @user_provided_name,
                     @uploaded_at,
                     @done_processing
  ) RETURNING id
`
const deleteStatement = `
  DELETE FROM files where id = @id
`
const getAllStatement = `
  SELECT * FROM files
`
const getOneStatement = `
  SELECT * FROM files WHERE id = ?
`

export function saveFileToDatabase(fileRow: FileRow): number {
  const del = db.prepare(deleteStatement)
  const insert: Statement<unknown[], { id: number }> = db.prepare(insertStatement)
  const transaction = db.transaction((fr: FileRow) => {
    if (fr.id) {
      del.run(fr)
    }
    return insert.get(fr)
  })
  const { id } = transaction(fileRow)
  return id
}

export function getFilesFromDatabase(): Array<FileRow> {
  const getAll: Statement<unknown[], FileRow> = db.prepare(getAllStatement)
  return getAll.all()
}

export function getFileFromDatabase(id: number): FileRow | undefined {
  const getOne: Statement<unknown[], FileRow> = db.prepare(getOneStatement)
  return getOne.get(id)
}
