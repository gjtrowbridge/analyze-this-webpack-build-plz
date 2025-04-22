import "./styles/ModuleRow.css"
import { JsonViewer } from '@textea/json-viewer'
import { ProcessedChunkInfo, ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { ModuleLink } from './ModuleLink'
import { ChunkLink } from './ChunkLink'
import { getModuleExtraSizeDueToDuplication } from '../helpers/modules'
import { inKB } from '../helpers/math'
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  Typography,
  Divider
} from '@mui/material'

export function ModuleRow(props: {
  module: ImmutableObject<ProcessedModuleInfo>
  showRawInfo: boolean,
  setShowRawInfo: (moduleDatabaseId: number) => void
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
  noLimitsOnLists?: boolean
}) {
  const {
    module,
    showRawInfo,
    setShowRawInfo,
    modulesByDatabaseId,
    chunksByDatabaseId,
    noLimitsOnLists,
  } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={module.rawFromWebpack} defaultInspectControl={() => false} />
    : null

  const numTotalModules = module.rawFromWebpack.modules?.length || 1
  const depth = module.pathFromEntry.length
  const shortestPath = module.pathFromEntry.map((moduleDatabaseId) => {
    const m = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <ListItem key={moduleDatabaseId}>
        <ModuleLink module={m} file={"file1"} />
      </ListItem>
    )
  })
  const chunkParents = module.parentChunkDatabaseIds.map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <ListItem key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </ListItem>
    )
  })

  const maxChildrenToShow = noLimitsOnLists ? 100000 : 10
  const maxParentsToShow = noLimitsOnLists ? 100000 : 10
  const children = Array.from(module.childModules.values()).slice(0, maxChildrenToShow).map((relationship) => {
    const moduleDatabaseId = relationship.childModuleDatabaseId
    const m = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <ListItem key={moduleDatabaseId}>
        <ModuleLink module={m} file={"file1"} />
      </ListItem>
    )
  })
  const parents = Array.from(module.parentModules.values()).slice(0, maxParentsToShow).map((relationship) => {
    const moduleDatabaseId = relationship.parentModuleDatabaseId
    const m = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <ListItem key={moduleDatabaseId}>
        <ModuleLink module={m} file={"file1"} />
      </ListItem>
    )
  })

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box>
          <Typography variant="h5" gutterBottom>
            <ModuleLink module={module} file={"file1"} />
          </Typography>
          <Typography variant="body1" gutterBottom>Depth: { depth === 0 ? "Not a descendant of any entry point file" : depth }</Typography>
          <Typography variant="body1" gutterBottom>Size: ~{inKB(module.rawFromWebpack.size)} kb</Typography>
          <Typography variant="body1" gutterBottom>Extra Size In Bundle Due To Duplication: ~{inKB(getModuleExtraSizeDueToDuplication(module))} kb</Typography>
          <Typography variant="body1" gutterBottom># Optimization Bailouts: { module.rawFromWebpack.optimizationBailout?.length || 0 }</Typography>
          <Typography variant="body1" gutterBottom>Module Was Concatenated?: { numTotalModules > 1 ? `Yes, to ${numTotalModules -1} other modules` : 'No' }</Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Chunk Parent(s)</Typography>
            <List>
              {chunkParents}
            </List>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Shortest path to entry point</Typography>
            <List>
              {shortestPath}
            </List>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Module Children ({module.childModules.size} total -- will only show up to {maxChildrenToShow})</Typography>
            <List>
              {children}
            </List>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Module Parents ({module.parentModules.size} total -- will only show up to {maxParentsToShow})</Typography>
            <List>
              {parents}
            </List>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => { 
                if (showRawInfo) { 
                  setShowRawInfo(-1) 
                } else { 
                  setShowRawInfo(module.moduleDatabaseId)
                }
              }}
            >
              {showRawInfo ? "Hide" : "Show"} Raw JSON
            </Button>
          </Box>
        </Box>
        {rawInfo && (
          <>
            <Divider sx={{ my: 2 }} />
            {rawInfo}
          </>
        )}
      </CardContent>
    </Card>
  )
}