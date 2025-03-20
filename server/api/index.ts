import { Router } from 'express'
import { chunksRouter } from './chunks'
import { filesRouter } from './files'
import { modulesRouter } from './modules'
import { uploadRouter } from './upload'

export const apiRouter = Router()

apiRouter.use('/chunks', chunksRouter)
apiRouter.use('/files', filesRouter)
apiRouter.use('/modules', modulesRouter)
apiRouter.use('/upload', uploadRouter)
