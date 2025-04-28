import { JsonViewer } from '@textea/json-viewer'
import { ImmutableObject, ImmutableMap } from '@hookstate/core'
import { inKB } from '../helpers/math'
import { ProcessedAssetInfo, ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
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

export function AssetRow(props: {
  file: 'file1' | 'file2'
  asset: ImmutableObject<ProcessedAssetInfo>
  showRawInfo: boolean,
  setShowRawInfo: (assetDatabaseId: number) => void
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
}) {
  const {
    file,
    asset,
    showRawInfo,
    setShowRawInfo,
    chunksByDatabaseId,
  } = props

  const [expanded, setExpanded] = useState(false)
  const [chunksExpanded, setChunksExpanded] = useState(false)

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

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box>
          <AssetLink asset={asset} file={file} />
          <Typography variant="body1" gutterBottom>Size: ~{inKB(asset.rawFromWebpack.size)} kb</Typography>
          
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