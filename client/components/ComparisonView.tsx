import { ReactChunkState, ReactModuleState } from '../types'

export function ComparisonView(props: {
  bothFilesAreSelected: boolean
  moduleStates: {
    file1: ReactModuleState,
    file2: ReactModuleState,
  },
  chunkStates: {
    file1: ReactChunkState,
    file2: ReactChunkState,
  }
}) {
  const { bothFilesAreSelected, moduleStates, chunkStates } = props
  const isLoaded = moduleStates.file1.ready &&
    moduleStates.file2.ready &&
    chunkStates.file1.ready &&
    chunkStates.file2.ready

  return (
    <div className="ComparisonView">
      {!bothFilesAreSelected && <p className={"warning"}>You need to select a main file AND a comparison file!</p>}
      {bothFilesAreSelected && !isLoaded && <p>Loading...</p>}
    </div>
  )
}
