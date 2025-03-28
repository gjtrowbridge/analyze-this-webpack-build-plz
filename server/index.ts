import express from 'express'
import path from 'path'
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

/**
 * Serve the index.html file if nothing else matches -- this should help enable client-side routing
 */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/client', 'index.html'))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
