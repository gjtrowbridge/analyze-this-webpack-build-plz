import { JsonViewer } from '@textea/json-viewer'
import { ImmutableObject, ImmutableMap } from '@hookstate/core'
import { getHumanReadableSize } from '../helpers/math'
import { ProcessedAssetInfo, ProcessedChunkInfo, ProcessedModuleInfo } from '../helpers/processModulesAndChunks'
import { 
  Box, 
  Card, 
  CardContent, 
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { AssetLink } from './AssetLink'
import { ChunkLink } from './ChunkLink'
import { ModuleLink } from './ModuleLink'

export function AssetRow(props: {
  file: 'file1' | 'file2'
  asset: ImmutableObject<ProcessedAssetInfo>
  showRawInfo: boolean,
  setShowRawInfo: (assetDatabaseId: number) => void
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
  modulesByDatabaseId: ImmutableMap<number, ProcessedModuleInfo>
  noLimitsOnLists?: boolean
}) {
  const {
    file,
    asset,
    showRawInfo,
    setShowRawInfo,
    chunksByDatabaseId,
    modulesByDatabaseId,
    noLimitsOnLists,
  } = props

  const [expanded, setExpanded] = useState(false)
  const [chunksExpanded, setChunksExpanded] = useState(false)
  const [modulesExpanded, setModulesExpanded] = useState(false)
  const [subModulesExpanded, setSubModulesExpanded] = useState(false)

  const maxItemsToShow = noLimitsOnLists ? 100000 : 10

  const chunkLinks = Array.from(asset.chunkDatabaseIds).map((chunkDatabaseId) => {
    const chunk = chunksByDatabaseId.get(chunkDatabaseId)
    if (!chunk) {
      return null
    }
    return (
      <ListItem key={chunkDatabaseId}>
        <ChunkLink chunk={chunk} file={file} includeSize={true} />
      </ListItem>
    )
  })

  const moduleLinks = Array.from(asset.moduleDatabaseIds)
    .slice(0, maxItemsToShow)
    .map((moduleDatabaseId) => {
      const module = modulesByDatabaseId.get(moduleDatabaseId)
      if (!module) {
        return null
      }
      return (
        <ListItem key={moduleDatabaseId}>
          <ModuleLink module={module} file={file} />
        </ListItem>
      )
    })

  const subModuleLinks = Array.from(asset.subModuleDatabaseIds)
    .slice(0, maxItemsToShow)
    .map((moduleDatabaseId) => {
      const module = modulesByDatabaseId.get(moduleDatabaseId)
      if (!module) {
        return null
      }
      return (
        <ListItem key={moduleDatabaseId}>
          <ModuleLink module={module} file={file} />
        </ListItem>
      )
    })

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box>
          <AssetLink asset={asset} file={file} />
          <Typography variant="body1" gutterBottom>Size: {getHumanReadableSize(asset.rawFromWebpack.size)}</Typography>
          
          <Accordion expanded={chunksExpanded} onChange={() => setChunksExpanded(!chunksExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Chunks ({asset.chunkDatabaseIds.size})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {chunkLinks}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={modulesExpanded} onChange={() => setModulesExpanded(!modulesExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Modules ({asset.moduleDatabaseIds.size} total -- will only show up to {maxItemsToShow})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {moduleLinks}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={subModulesExpanded} onChange={() => setSubModulesExpanded(!subModulesExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Submodules ({asset.subModuleDatabaseIds.size} total -- will only show up to {maxItemsToShow})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {subModuleLinks}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>See raw webpack JSON</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <JsonViewer value={asset.rawFromWebpack} defaultInspectControl={() => false} />
            </AccordionDetails>
          </Accordion>
        </Box>
      </CardContent>
    </Card>
  )
} 