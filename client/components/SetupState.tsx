import { useModules } from '../hooks/useModules'
import { useChunks } from '../hooks/useChunks'
import { useProcessState } from '../hooks/useProcessState'
import { useGetFiles } from '../hooks/useFiles'
import { ReactElement } from 'react'

export function SetupState(): ReactElement {
  useGetFiles()
  useModules()
  useChunks()
  useProcessState()

  return null
}

