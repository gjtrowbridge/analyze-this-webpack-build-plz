import { Button, ButtonGroup } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

export function SortControl<SortBy extends string>(args: {
  controlFor: SortBy
  sortBy: SortBy
  setSortBy: (sortBy: SortBy) => void
  sortAscending: boolean
  setSortAscending: (sortAscending: boolean) => void
}) {
  const {
    controlFor,
    sortBy,
    setSortBy,
    sortAscending,
    setSortAscending,
  } = args

  const alreadySortingByThis = controlFor === sortBy

  const onClick = () => {
    if (alreadySortingByThis) {
      setSortAscending(!sortAscending)
    }
    setSortBy(controlFor)
  }

  return (
    <ButtonGroup variant="outlined" size="small">
      <Button
        onClick={onClick}
        variant={alreadySortingByThis ? "contained" : "outlined"}
        startIcon={alreadySortingByThis ? (sortAscending ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />) : undefined}
      >
        {controlFor}
      </Button>
    </ButtonGroup>
  )
}