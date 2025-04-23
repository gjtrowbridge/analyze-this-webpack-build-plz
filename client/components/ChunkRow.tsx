import "./styles/ChunkRow.css"
import { JsonViewer } from '@textea/json-viewer'
import {
  ProcessedChunkInfo,
  ProcessedModuleInfo,
  ProcessedNamedChunkGroupInfo
} from '../helpers/processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { getHumanReadableChunkName } from '../helpers/chunks'
import { ModuleLink } from './ModuleLink'
import { ChunkLink } from './ChunkLink'
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
import { NamedChunkGroupLink } from './NamedChunkGroupLink'

export function ChunkRow(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  showRawInfo: boolean,
  setShowRawInfo: (chunkDatabaseId: number) => void
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
  namedChunkGroupsByDatabaseId: ImmutableMap<number, ProcessedNamedChunkGroupInfo>
  noLimitsOnLists?: boolean
}) {
  const {
    chunk,
    showRawInfo,
    setShowRawInfo,
    chunksByDatabaseId,
    modulesByDatabaseId,
    namedChunkGroupsByDatabaseId,
    noLimitsOnLists,
  } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={chunk} defaultInspectControl={() => false} />
    : null

  const maxModuleChildrenToShow = noLimitsOnLists ? 100000 : 10
  const maxChunkParentsToShow = noLimitsOnLists ? 100000 : 10
  const maxChunkChildrenToShow = noLimitsOnLists ? 100000 : 10
  const maxChunkSiblingsToShow = noLimitsOnLists ? 100000 : 10

  const childModules = Array.from(chunk.childModuleDatabaseIds).slice(0, maxModuleChildrenToShow).map((moduleDatabaseId) => {
    const module = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <ListItem key={moduleDatabaseId}>
        <ModuleLink module={module} file={"file1"} />
      </ListItem>
    )
  })

  const chunkParents = Array.from(chunk.parentChunkDatabaseIds).slice(0, maxChunkParentsToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <ListItem key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </ListItem>
    )
  })

  const chunkChildren = Array.from(chunk.childChunkDatabaseIds).slice(0, maxChunkChildrenToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <ListItem key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </ListItem>
    )
  })

  const chunkSiblings = Array.from(chunk.siblingChunkDatabaseIds).slice(0, maxChunkSiblingsToShow).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <ListItem key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </ListItem>
    )
  })

  const shortestPath = chunk.pathFromEntry.map((chunkDatabaseId) => {
    const c = chunksByDatabaseId.get(chunkDatabaseId)
    return (
      <ListItem key={chunkDatabaseId}>
        <ChunkLink chunk={c} file={"file1"} />
      </ListItem>
    )
  })

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {getHumanReadableChunkName(chunk)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Webpack Id: {chunk.rawFromWebpack.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Size: {Math.round(chunk.rawFromWebpack.size / 1024)} kb
          </Typography>
          <Typography variant="body2" color={"text.secondary"}>
            Depth From Entry: {chunk.pathFromEntry.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generated Asset Name(s): {chunk.rawFromWebpack.files?.join(", ")}
          </Typography>
        </Box>
        <Box>
          <Typography variant={'h6'}>
            <List>
              {Array.from(chunk.namedChunkGroupDatabaseIds).map((ncgId) => {
                const ncg = namedChunkGroupsByDatabaseId.get(ncgId)
                if (!ncg) {
                  return null
                }
                return (
                  <ListItem key={ncgId}>
                    <NamedChunkGroupLink namedChunkGroup={ncg} file={'file1'} />
                  </ListItem>
                )
              })}
            </List>
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Shortest path to entry point</Typography>
          <List>
            {shortestPath}
          </List>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Chunk Parents ({chunk.parentChunkDatabaseIds.size} total -- will only show up to {maxChunkParentsToShow})
          </Typography>
          <List dense>
            {chunkParents}
          </List>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Chunk Children ({chunk.childChunkDatabaseIds.size} total -- will only show up to {maxChunkChildrenToShow})
          </Typography>
          <List dense>
            {chunkChildren}
          </List>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Chunk Siblings ({chunk.siblingChunkDatabaseIds.size} total -- will only show up to {maxChunkSiblingsToShow})
          </Typography>
          <List dense>
            {chunkSiblings}
          </List>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Module Children ({chunk.childModuleDatabaseIds.size} total -- will only show up to {maxModuleChildrenToShow})
          </Typography>
          <List dense>
            {childModules}
          </List>
        </Box>

        <Button 
          variant="outlined" 
          size="small"
          onClick={() => { 
            if (showRawInfo) { 
              setShowRawInfo(-1) 
            } else { 
              setShowRawInfo(chunk.chunkDatabaseId)
            }
          }}
        >
          Show {showRawInfo ? "Less" : "More"}
        </Button>

        {rawInfo && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            {rawInfo}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
