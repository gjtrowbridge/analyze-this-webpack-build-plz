import React from 'react';
import { useParams } from 'react-router';
import { useHookstate } from '@hookstate/core';
import { file1ProcessedGlobalState } from '../globalState';
import { Box, Typography } from '@mui/material';
import { NamedChunkGroupRow } from './NamedChunkGroupRow';

interface NamedChunkGroupRowPageProps {
  file: 'file1' | 'file2';
}

export const NamedChunkGroupRowPage: React.FC<NamedChunkGroupRowPageProps> = ({ file }) => {
  const { namedChunkGroupDatabaseId } = useParams<{ namedChunkGroupDatabaseId: string }>();
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState);

  const stateOrNull = file1ProcessedState.ornull;
  if (stateOrNull === null) {
    return <Typography>Loading and processing data...</Typography>;
  }

  const namedChunkGroupsByDatabaseId = stateOrNull.namedChunkGroupsByDatabaseId.get();
  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get();
  const namedChunkGroup = namedChunkGroupsByDatabaseId.get(Number(namedChunkGroupDatabaseId));

  if (!namedChunkGroup) {
    return <Typography>Named chunk group not found</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <NamedChunkGroupRow
        file={file}
        namedChunkGroup={namedChunkGroup}
        chunksByDatabaseId={chunksByDatabaseId}
      />
    </Box>
  );
}; 