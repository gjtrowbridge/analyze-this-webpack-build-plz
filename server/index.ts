import * as express from 'express'
import { apiRouter } from './api'

const app = express()
const port = 8080

app.use('/api', apiRouter)
app.use('/', express.static('dist/client'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
