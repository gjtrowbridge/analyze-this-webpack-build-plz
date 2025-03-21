import { ModuleRow } from '../types'
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
  SELECT * FROM modules WHERE id >= ? LIMIT ?
`

const getOneStatement = `
  SELECT * FROM files WHERE id = ?
`

export function saveModuleToDatabase(moduleRow: ModuleRow) {
  const insert = db.prepare(insertStatement)
  insert.run(moduleRow)
}

export function saveModulesToDatabase(moduleRows: Array<ModuleRow>) {
  const insert = db.prepare(insertStatement)
  const transaction = db.transaction((mrs: Array<ModuleRow>) => {
    for (let mr of mrs) {
      insert.run(mr)
    }
  })
  transaction(moduleRows)
}

export function getModulesFromDatabase(args: {
  limit: number,
  minIdNonInclusive?: number,
}): Array<ModuleRow> {
  const {
    minIdNonInclusive,
    limit,
  } = args

  const minId = minIdNonInclusive ?? -1

  const getMany: Statement<unknown[], ModuleRow> = db.prepare(getManyStatement)
  return getMany.all(minId, limit)
}

export function getModuleFromDatabase(id: number): ModuleRow | undefined {
  const getOne: Statement<unknown[], ModuleRow> = db.prepare(getOneStatement)
  return getOne.get(id)
}
