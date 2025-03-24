import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { FileRow } from '../../shared/types'
import { errorsState, filesState, FileState } from '../globalState'
import { useHookstate } from '@hookstate/core'

export function useFiles() {
  const files = useHookstate(filesState)
  const errors = useHookstate(errorsState)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    void (async () => {
      files.set({ status: 'LOADING' })
      const res = await axios.get<{ fileRows: Array<FileRow & { id: number }>}>(`/api/files`)
      if (res.status > 300) {
        files.set({ status: 'ERROR' })
        errors.merge("[FILES]: something went wrong fetching the list of available files")
        return
      }
      const { fileRows } = res.data
      files.merge({
        status: 'LOADED',
        existingFiles: fileRows,
        selectedFileId1: fileRows[0].id,
      })
    })()
  }, [refreshCount]);

  /**
   * Returns a function to refresh the files
   */
  const refreshFilesFn = useCallback(() => {
    setRefreshCount(refreshCount + 1)
  }, [refreshCount, setRefreshCount])

  return refreshFilesFn
}
