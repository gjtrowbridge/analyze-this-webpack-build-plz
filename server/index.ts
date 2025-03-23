import express from 'express'
import { apiRouter } from './api'

const app = express()
const port = 8080

app.use('', (req, res, next) => {
    console.log('HTTP request received', {
        verb: req.method,
        path: req.path,
    })
    next()
})
app.use('/api', apiRouter)
app.use('/', express.static('dist/client'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
