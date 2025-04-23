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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { NamedChunkGroupLink } from './NamedChunkGroupLink'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'

export function ChunkRow(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  showRawInfo: boolean,
  setShowRawInfo: (chunkDatabaseId: number) => void
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
  namedChunkGroupsByDatabaseId: ImmutableMap<number, ProcessedNamedChunkGroupInfo>
  noLimitsOnLists?: boolean
  file: 'file1' | 'file2'
}) {
  const {
    chunk,
    showRawInfo,
    setShowRawInfo,
    chunksByDatabaseId,
    modulesByDatabaseId,
    namedChunkGroupsByDatabaseId,
    noLimitsOnLists,
    file,
  } = props

  const [expanded, setExpanded] = useState(false)
  const [namedChunkGroupsExpanded, setNamedChunkGroupsExpanded] = useState(false)
  const [shortestPathExpanded, setShortestPathExpanded] = useState(false)
  const [chunkChildrenExpanded, setChunkChildrenExpanded] = useState(false)
  const [chunkParentsExpanded, setChunkParentsExpanded] = useState(false)
  const [chunkSiblingsExpanded, setChunkSiblingsExpanded] = useState(false)
  const [moduleChildrenExpanded, setModuleChildrenExpanded] = useState(false)

  const childModules = Array.from(chunk.childModuleDatabaseIds)
    .map((moduleDatabaseId) => {
      const module = modulesByDatabaseId.get(moduleDatabaseId)
      return {
        id: moduleDatabaseId,
        module,
        name: module?.rawFromWebpack.name || ''
      }
    })
    .filter(item => item.module) // Filter out any null modules
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, module }) => (
      <ListItem key={id}>
        <ModuleLink module={module} file={file} />
      </ListItem>
    ))

  const chunkParents = Array.from(chunk.parentChunkDatabaseIds)
    .map((chunkDatabaseId) => {
      const chunk = chunksByDatabaseId.get(chunkDatabaseId)
      return {
        id: chunkDatabaseId,
        chunk,
        name: chunk ? getHumanReadableChunkName(chunk) : ''
      }
    })
    .filter(item => item.chunk) // Filter out any null chunks
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, chunk }) => (
      <ListItem key={id}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </ListItem>
    ))

  const chunkChildren = Array.from(chunk.childChunkDatabaseIds)
    .map((chunkDatabaseId) => {
      const chunk = chunksByDatabaseId.get(chunkDatabaseId)
      return {
        id: chunkDatabaseId,
        chunk,
        name: chunk ? getHumanReadableChunkName(chunk) : ''
      }
    })
    .filter(item => item.chunk) // Filter out any null chunks
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, chunk }) => (
      <ListItem key={id}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </ListItem>
    ))

  const chunkSiblings = Array.from(chunk.siblingChunkDatabaseIds)
    .map((chunkDatabaseId) => {
      const chunk = chunksByDatabaseId.get(chunkDatabaseId)
      return {
        id: chunkDatabaseId,
        chunk,
        name: chunk ? getHumanReadableChunkName(chunk) : ''
      }
    })
    .filter(item => item.chunk) // Filter out any null chunks
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, chunk }) => (
      <ListItem key={id}>
        <ChunkLink chunk={chunk} file={'file1'} />
      </ListItem>
    ))

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
            <ChunkLink chunk={chunk} file={'file1'} />
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

        <Accordion expanded={namedChunkGroupsExpanded} onChange={() => setNamedChunkGroupsExpanded(!namedChunkGroupsExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Named Chunk Groups ({chunk.namedChunkGroupDatabaseIds.size})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {namedChunkGroupsExpanded && (
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
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={shortestPathExpanded} onChange={() => setShortestPathExpanded(!shortestPathExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Shortest Path to Entry Point ({chunk.pathFromEntry.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {shortestPathExpanded && (
              <List>
                {shortestPath}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={chunkChildrenExpanded} onChange={() => setChunkChildrenExpanded(!chunkChildrenExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Chunk Children ({chunk.childChunkDatabaseIds.size})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {chunkChildrenExpanded && (
              <List dense>
                {chunkChildren}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={chunkParentsExpanded} onChange={() => setChunkParentsExpanded(!chunkParentsExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Chunk Parents ({chunk.parentChunkDatabaseIds.size})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {chunkParentsExpanded && (
              <List dense>
                {chunkParents}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={chunkSiblingsExpanded} onChange={() => setChunkSiblingsExpanded(!chunkSiblingsExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Chunk Siblings ({chunk.siblingChunkDatabaseIds.size})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {chunkSiblingsExpanded && (
              <List dense>
                {chunkSiblings}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={moduleChildrenExpanded} onChange={() => setModuleChildrenExpanded(!moduleChildrenExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Module Children ({chunk.childModuleDatabaseIds.size})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {moduleChildrenExpanded && (
              <List dense>
                {childModules}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>See raw webpack JSON</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {expanded && (
              <JsonViewer value={chunk} defaultInspectControl={() => false} />
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  )
}
