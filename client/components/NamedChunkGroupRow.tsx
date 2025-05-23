import { JsonViewer } from '@textea/json-viewer';
import { ImmutableMap, ImmutableObject } from '@hookstate/core';
import { ProcessedChunkInfo, ProcessedNamedChunkGroupInfo } from '../helpers/processModulesAndChunks';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { NamedChunkGroupLink } from './NamedChunkGroupLink';
import { ChunkLink } from './ChunkLink';
import { getHumanReadableSize } from '../helpers/math';

export function NamedChunkGroupRow(props: {
  file: 'file1' | 'file2';
  namedChunkGroup: ImmutableObject<ProcessedNamedChunkGroupInfo>;
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>;
  showRawInfo?: boolean;
  setShowRawInfo?: (namedChunkGroupDatabaseId: number) => void;
}) {
  const {
    file,
    namedChunkGroup,
    chunksByDatabaseId,
    showRawInfo,
    setShowRawInfo,
  } = props;

  const [expanded, setExpanded] = useState(false);
  const [chunksExpanded, setChunksExpanded] = useState(false);

  const chunkLinks = Array.from(namedChunkGroup.chunkDatabaseIds)
    .map((chunkDatabaseId) => {
      const chunk = chunksByDatabaseId.get(chunkDatabaseId);
      if (!chunk) {
        return null;
      }
      return (
        <ListItem key={chunkDatabaseId}>
          <ChunkLink chunk={chunk} file={file} includeSize={true} />
        </ListItem>
      );
    })
    .filter(Boolean);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            <NamedChunkGroupLink namedChunkGroup={namedChunkGroup} file={file} />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Size: {getHumanReadableSize(namedChunkGroup.totalSize)} ({namedChunkGroup.chunkDatabaseIds.size} chunks)
          </Typography>
        </Box>

        <Accordion expanded={chunksExpanded} onChange={() => setChunksExpanded(!chunksExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Associated Chunks ({namedChunkGroup.chunkDatabaseIds.size})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {chunksExpanded && (
              <List dense>
                {chunkLinks}
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
              <JsonViewer value={namedChunkGroup.rawFromWebpack} defaultInspectControl={() => false} />
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
} 