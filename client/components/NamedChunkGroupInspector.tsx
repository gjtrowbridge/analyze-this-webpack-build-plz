import { useCallback, useState } from 'react';
import { Box, Card, CardContent, Grid, TextField, Typography, Alert } from '@mui/material';
import { useHookstate } from '@hookstate/core';
import { file1ProcessedGlobalState } from '../globalState';
import { SortControl } from './SortControl';
import { getStatistics } from '../helpers/math';
import { ProcessedNamedChunkGroupInfo } from '../helpers/processModulesAndChunks';
import { NamedChunkGroupRow } from './NamedChunkGroupRow';

export type NamedChunkGroupSortBy = 'Name' | 'Chunk Count';

export const NamedChunkGroupInspector: React.FC = () => {
  const file1ProcessedState = useHookstate(file1ProcessedGlobalState);
  const [sortBy, setSortBy] = useState<NamedChunkGroupSortBy>("Name");
  const [sortAscending, setSortAscending] = useState<boolean>(false);
  const [filterName, setFilterName] = useState<string>("");
  const [showMoreId, setShowMoreId] = useState<number>(-1);

  const sortFn = useCallback((a: ProcessedNamedChunkGroupInfo, b: ProcessedNamedChunkGroupInfo) => {
    const sortOrder = sortAscending ? 1 : -1;
    if (sortBy === "Name") {
      return (a.name.localeCompare(b.name)) * sortOrder;
    } else if (sortBy === "Chunk Count") {
      return (a.chunkDatabaseIds.size - b.chunkDatabaseIds.size) * sortOrder;
    }
    return 0;
  }, [sortAscending, sortBy]);

  const stateOrNull = file1ProcessedState.ornull;
  if (stateOrNull === null) {
    return <Typography>Loading and processing data, named chunk group data will be visible soon...</Typography>;
  }

  const namedChunkGroupsByDatabaseId = stateOrNull.namedChunkGroupsByDatabaseId.get();
  const chunksByDatabaseId = stateOrNull.chunksByDatabaseId.get();
  const allNamedChunkGroups = Array.from(namedChunkGroupsByDatabaseId.values());
  const filteredNamedChunkGroups = allNamedChunkGroups
    .filter((ncg) => {
      if (filterName === "") {
        return true;
      }
      return ncg.name.toLowerCase().includes(filterName.toLowerCase());
    })
    .sort(sortFn);

  const namedChunkGroupRows = filteredNamedChunkGroups
    .slice(0, 50)
    .map((ncg) => {
      return (
        <NamedChunkGroupRow
          key={ncg.namedChunkGroupDatabaseId}
          file={'file1'}
          namedChunkGroup={ncg}
          chunksByDatabaseId={chunksByDatabaseId}
          showRawInfo={showMoreId === ncg.namedChunkGroupDatabaseId}
          setShowRawInfo={setShowMoreId}
        />
      );
    });

  const {
    mean,
    standardDeviation,
  } = getStatistics(filteredNamedChunkGroups.map((ncg) => ncg.chunkDatabaseIds.size));

  const noNamedChunkGroupWarning = allNamedChunkGroups.length > 0 ? null : (
    <Alert severity="warning" sx={{ mb: 2 }}>
      No named chunk groups found -- Make sure you generate your stats.json with named chunk group output enabled!
    </Alert>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Sort by:</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <SortControl<NamedChunkGroupSortBy> controlFor={"Name"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                <SortControl<NamedChunkGroupSortBy> controlFor={"Chunk Count"} sortBy={sortBy} setSortBy={setSortBy} sortAscending={sortAscending} setSortAscending={setSortAscending} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Filter By Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        There are {allNamedChunkGroups.length} total named chunk groups, {filteredNamedChunkGroups.length} named chunk groups that pass your filters, and {namedChunkGroupRows.length} being shown
      </Typography>
      {noNamedChunkGroupWarning}
      <Typography variant="subtitle1" gutterBottom>
        For the filtered named chunk groups, the mean number of chunks is {mean.toFixed(2)}, the std deviation is {standardDeviation.toFixed(2)}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {namedChunkGroupRows}
      </Box>
    </Box>
  );
}; 