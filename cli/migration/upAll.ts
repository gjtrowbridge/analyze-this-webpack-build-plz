import { db } from '../../server/db/database'
import { migrations } from './migrations'

migrations.forEach((m) => {
  m.up(db)
})
