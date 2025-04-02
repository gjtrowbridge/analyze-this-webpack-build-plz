import { ModuleRow } from '../../../shared/types'
import { Statement } from 'better-sqlite3'
import { db } from '../database'
import { convertToSharedModuleType, DatabaseModuleRow } from '../../helpers/databaseTypes'


const insertStatement = `
  INSERT INTO modules (
                     module_id,
                     module_identifier,
                     raw_json,
                     file_id
  ) VALUES (
                     @module_id,
                     @module_identifier,
                     @raw_json,
                     @file_id
  )
`

const getManyStatement = `
  SELECT * FROM modules
           WHERE
               id > @minIdNonInclusive AND
               file_id = @fileId
           ORDER BY id
           LIMIT @limit
`

const getOneStatement = `
  SELECT * FROM modules WHERE id = ?
`

export function saveModuleToDatabase(dbRow: DatabaseModuleRow) {
  const insert = db.prepare(insertStatement)
  insert.run(dbRow)
}

export function saveModulesToDatabase(dbRows: Array<Omit<DatabaseModuleRow, 'id'>>) {
  const insert = db.prepare(insertStatement)
  const transaction = db.transaction((rows: Array<Omit<DatabaseModuleRow, 'id'>>) => {
    for (let row of rows) {
      insert.run(row)
    }
  })
  transaction(dbRows)
}

export function getModulesFromDatabase(args: {
  fileId: number,
  limit: number,
  minIdNonInclusive: number,
}): Array<ModuleRow> {
  const getMany: Statement<unknown[], DatabaseModuleRow> = db.prepare(getManyStatement)
  const dbRows = getMany.all(args)
  return dbRows.map(convertToSharedModuleType)
}

export function getModuleFromDatabase(id: number): ModuleRow | undefined {
  const getOne: Statement<unknown[], DatabaseModuleRow> = db.prepare(getOneStatement)
  const dbRow = getOne.get(id)
  return convertToSharedModuleType(dbRow)
}
