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
  Card, 
  CardContent, 
  List, 
  ListItem, 
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'

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

  const [expanded, setExpanded] = useState(false)

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
  const associatedAssets = []
  const chunkParents = module.parentChunkDatabaseIds.map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    chunk.rawFromWebpack.files?.forEach((file) => {
      associatedAssets.push(file)
    })
    return (
      <ListItem key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} includeAssociatedAssets={true} />
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
          <Typography variant="body1" gutterBottom># Associated Files: { associatedAssets.length } (See Chunk Parents for more info)</Typography>
          <Typography variant="body1" gutterBottom>Size: ~{inKB(module.rawFromWebpack.size)} kb</Typography>
          <Typography variant="body1" gutterBottom>Extra Size In Bundle Due To Duplication: ~{inKB(getModuleExtraSizeDueToDuplication(module))} kb</Typography>
          <Typography variant="body1" gutterBottom># Optimization Bailouts: { module.rawFromWebpack.optimizationBailout?.length || 0 }</Typography>
          <Typography variant="body1" gutterBottom>Module Was Concatenated?: { numTotalModules > 1 ? `Yes, to ${numTotalModules -1} other modules` : 'No' }</Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Chunk Parents ({module.parentChunkDatabaseIds.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {chunkParents}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Shortest Path to Entry Point ({module.pathFromEntry.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {shortestPath}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Module Children ({module.childModules.size} total -- will only show up to {maxChildrenToShow})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {children}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Module Parents ({module.parentModules.size} total -- will only show up to {maxParentsToShow})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {parents}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>See raw webpack JSON</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <JsonViewer value={module.rawFromWebpack} defaultInspectControl={() => false} />
            </AccordionDetails>
          </Accordion>
        </Box>
      </CardContent>
    </Card>
  )
}