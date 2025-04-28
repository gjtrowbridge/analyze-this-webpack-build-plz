import { JsonViewer } from '@textea/json-viewer'
import { ImmutableObject } from '@hookstate/core'
import { inKB } from '../helpers/math'
import { ProcessedAssetInfo } from '../helpers/processModulesAndChunks'
import { 
  Box, 
  Card, 
  CardContent, 
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { Link } from 'react-router'

export function AssetRow(props: {
  file: 'file1' | 'file2'
  asset: ImmutableObject<ProcessedAssetInfo>
  showRawInfo: boolean,
  setShowRawInfo: (assetDatabaseId: number) => void
}) {
  const {
    file,
    asset,
    showRawInfo,
    setShowRawInfo,
  } = props

  const [expanded, setExpanded] = useState(false)

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box>
          <Typography variant="h5" gutterBottom>
            <Link to={`/assets/${file}/${asset.assetDatabaseId}`}>
              {asset.rawFromWebpack.name}
            </Link>
          </Typography>
          <Typography variant="body1" gutterBottom>Size: ~{inKB(asset.rawFromWebpack.size)} kb</Typography>
          
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