import { Router } from 'express'
import { uploadRouter } from './upload'
import { chunksRouter } from './chunks'
import { modulesRouter } from './modules'
import { filesRouter } from './files'

export const apiRouter = Router()

apiRouter.use('/files', filesRouter)
apiRouter.use('/modules', modulesRouter)
apiRouter.use('/chunks', chunksRouter)
apiRouter.use('/upload', uploadRouter)
