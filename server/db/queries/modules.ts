import { ModuleRow } from '../../../shared/types'
import { Statement } from 'better-sqlite3'
import { db } from '../database'


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

export function saveModuleToDatabase(moduleRow: ModuleRow) {
  const insert = db.prepare(insertStatement)
  insert.run(moduleRow)
}

export function saveModulesToDatabase(moduleRows: Array<Omit<ModuleRow, 'id'>>) {
  const insert = db.prepare(insertStatement)
  const transaction = db.transaction((mrs: Array<Omit<ModuleRow, 'id'>>) => {
    for (let mr of mrs) {
      insert.run(mr)
    }
  })
  transaction(moduleRows)
}

export function getModulesFromDatabase(args: {
  fileId: number,
  limit: number,
  minIdNonInclusive: number,
}): Array<ModuleRow> {
  const getMany: Statement<unknown[], ModuleRow> = db.prepare(getManyStatement)
  return getMany.all(args)
}

export function getModuleFromDatabase(id: number): ModuleRow | undefined {
  const getOne: Statement<unknown[], ModuleRow> = db.prepare(getOneStatement)
  return getOne.get(id)
}
