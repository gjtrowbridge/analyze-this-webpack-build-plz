import { db } from '../../server/db/database'
import { migrations } from './migrations'

migrations.reverse().forEach((m) => {
  console.log(`Downing ${m.name}`)
  m.down(db)
})