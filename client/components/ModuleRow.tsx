import "./styles/ModuleRow.css"
import { JsonViewer } from '@textea/json-viewer'
import { ProcessedChunkInfo, ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { ModuleLink } from './ModuleLink'
import { ChunkLink } from './ChunkLink'
import { getModuleExtraSizeDueToDuplication, getModuleSize } from '../helpers/modules'
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
import { Fragment, useState } from 'react'

export function ModuleRow(props: {
  file: 'file1' | 'file2'
  module: ImmutableObject<ProcessedModuleInfo>
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
  noLimitsOnLists?: boolean
}) {
  const {
    file,
    module,
    modulesByDatabaseId,
    chunksByDatabaseId,
    noLimitsOnLists,
  } = props

  const [expanded, setExpanded] = useState(false)

  const depth = module.pathFromEntry.length
  const shortestPath = module.pathFromEntry.map((moduleDatabaseId) => {
    const m = modulesByDatabaseId.get(moduleDatabaseId)
    return (
      <ListItem key={moduleDatabaseId}>
        <ModuleLink module={m} file={file} />
      </ListItem>
    )
  })
  const associatedAssets = []
  const chunkParents = Array.from(module.parentChunkDatabaseIds).map((chunkDatabaseId) => {
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
  const parentChunkFromSuperModuleElements = module.isSubModule ? Array.from(module.parentChunkDatabaseIdsFromSuperModule).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    chunk.rawFromWebpack.files?.forEach((file) => {
      associatedAssets.push(file)
    })
    return (
      <ListItem key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={'file1'} includeAssociatedAssets={true} />
      </ListItem>
    )
  }) : null

  const includeSubModulesInSizeCalcs = false

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
  const moduleHasConcatenatedSubModules = module.innerConcatenatedModuleDatabaseIds.size > 0
  const concatenatedSubModuleElements = Array.from(module.innerConcatenatedModuleDatabaseIds.values()).slice(0, maxChildrenToShow).map((subModuleDatabaseId) => {
    const subModule = modulesByDatabaseId.get(subModuleDatabaseId)
    return (
      <ListItem key={subModuleDatabaseId}>
        <ModuleLink module={subModule} file={"file1"} />
      </ListItem>
    )
  })
  const subModuleSection = moduleHasConcatenatedSubModules ? (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Concatenated Sub-modules ({module.innerConcatenatedModuleDatabaseIds.size} total -- will only show up to {maxChildrenToShow})</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {concatenatedSubModuleElements}
        </List>
      </AccordionDetails>
    </Accordion>
  ) : null

  const sizeElements = moduleHasConcatenatedSubModules ?
    (
      <Fragment>
        <Typography variant="body1" gutterBottom>Size (With Concatenated Submodules): ~{inKB(getModuleSize({
          module,
          includeSubModules: true,
        }))} kb</Typography>
        <Typography variant="body1" gutterBottom>Size (JUST this module): ~{inKB(getModuleSize({
          module,
          includeSubModules: false,
        }))} kb</Typography>
      </Fragment>
    ) : (
      <Typography variant="body1" gutterBottom>Size (This module has no concatenated submodules): ~{inKB(getModuleSize({
        module,
        includeSubModules: false,
      }))} kb</Typography>
    )

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box>
          <Typography variant="h5" gutterBottom>
            <ModuleLink module={module} file={"file1"} />
          </Typography>
          <Typography variant="body1" gutterBottom>Depth: { depth === 0 ? "Not a descendant of any entry point file" : depth }</Typography>
          <Typography variant="body1" gutterBottom># Associated Files: { associatedAssets.length } (See Chunk Parents for more info)</Typography>
          {sizeElements}
          <Typography variant="body1" gutterBottom>Extra Size In Bundle Due To Duplication: ~{inKB(getModuleExtraSizeDueToDuplication({
            module,
            includeSubModules: includeSubModulesInSizeCalcs
          }))} kb</Typography>
          <Typography variant="body1" gutterBottom># Optimization Bailouts: { module.rawFromWebpack.optimizationBailout?.length || 0 }</Typography>
          <Typography variant="body1" gutterBottom>Module Concatenation Status: {
            module.isSuperModule ?
              'Super-module (has concatenated sub-modules)' :
              module.isSubModule ?
                'Sub-module (is concatenated onto a super-module)' :
                'Normal (has not been concatenated with any other modules)'
          }</Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Direct Chunk Parents ({module.parentChunkDatabaseIds.size})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {chunkParents}
              </List>
            </AccordionDetails>
          </Accordion>

          {module.isSubModule ?
            (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Implicit Chunk Parents From Concatenated Super-module(s) ({module.parentChunkDatabaseIdsFromSuperModule.size})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {parentChunkFromSuperModuleElements}
                  </List>
                </AccordionDetails>
              </Accordion>
            ) : null}

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

          {subModuleSection}

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