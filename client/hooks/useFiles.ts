import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { FileRow } from '../../shared/types'
import { errorsState, filesState, FileState, LoadedFileData } from '../globalState'
import { useHookstate } from '@hookstate/core'

export function useRefreshFiles() {
  const files = useHookstate(filesState)
  const errors = useHookstate(errorsState)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    void (async () => {
      files.set({ status: 'LOADING' })
      try {
        const res = await axios.get<{ fileRows: Array<FileRow & { id: number }>}>(`/api/files`)
        const { fileRows } = res.data
        files.merge({
          status: 'LOADED',
          existingFiles: fileRows,
          selectedFileId1: fileRows[0].id,
        })
      } catch (e) {
        files.set({ status: 'ERROR' })
        errors.merge(["[FILES]: something went wrong fetching the list of available files"])
      }
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

export function useFileNames() {
  const files = useHookstate(filesState)
  const f = files.get()

  const fileNames = { file1: 'None', file2: 'None', bothAreSelected: false }

  if (f.status === 'LOADED') {
    const file1 = f.existingFiles.find((a) => {
      return a.id === f.selectedFileId1
    })
    const file2 = f.existingFiles.find((a) => {
      return a.id === f.selectedFileId2
    })

    if (file1) {
      fileNames.file1 = `${file1.user_provided_name}`
    }
    if (file2) {
      fileNames.file2 = `${file2.user_provided_name}`
    }
    if (file1 && file2) {
      fileNames.bothAreSelected = true
    }
  }
  return fileNames
}

export function useFileIds() {
  const files = useHookstate(filesState)
  const f = files.get()

  let fileIds: {
    file1: number | null
    file2: number | null
  } = {
    file1: null,
    file2: null,
  }
  if (f.status === 'LOADED') {
    fileIds.file1 = f.selectedFileId1 ?? null
    fileIds.file2 = f.selectedFileId2 ?? null
  }
  return fileIds
}
