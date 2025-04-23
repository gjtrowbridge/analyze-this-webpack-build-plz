import { Router } from 'express'
import { chunksRouter } from './chunks'
import { filesRouter } from './files'
import { modulesRouter } from './modules'
import { uploadRouter } from './upload'
import { assetsRouter } from './assets'
import { namedChunkGroupsRouter } from './namedChunkGroups'

export const apiRouter = Router()

apiRouter.use('/chunks', chunksRouter)
apiRouter.use('/files', filesRouter)
apiRouter.use('/modules', modulesRouter)
apiRouter.use('/upload', uploadRouter)
apiRouter.use('/assets', assetsRouter)
apiRouter.use('/named-chunk-groups', namedChunkGroupsRouter)
