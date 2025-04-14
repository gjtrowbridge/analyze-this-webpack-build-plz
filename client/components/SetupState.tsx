import { useGetFiles } from '../hooks/useFiles'
import { ReactElement } from 'react'

export function SetupState(): ReactElement {
  useGetFiles()

  return null
}

