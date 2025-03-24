import { useEffect, useState } from 'react'
import axios from 'axios'
import { FileLoader } from './FileLoader'
import { FileRow } from '../../shared/types'
import { convertToInteger } from '../../server/helpers/misc'


export function FileSelector(props: {
  selectedFileId1: number | null,
  selectedFileId2: number | null,
  setSelectedFileId1: (f: number | null) => void
  setSelectedFileId2: (f: number | null) => void
}) {
  const {
    selectedFileId1,
    selectedFileId2,
    setSelectedFileId1,
    setSelectedFileId2,
  } = props
  const [existingFiles, setExistingFiles] = useState<Array<FileRow & { id: number }> | null>(null)
  const [error, setError] = useState<string>("")
  const [fileWasUploadedCount, setFileWasUploadedCount] = useState<number>(0)

  // Get the existing files
  useEffect(() => {
    void (async () => {
      const res = await axios.get<{ fileRows: Array<FileRow & { id: number }>}>(`/api/files`)
      const { fileRows } = res.data
      if (res.status > 300) {
        setError("ERROR: Something went wrong fetching the list of files")
      }
      if (selectedFileId1 === null) {
        setSelectedFileId1(fileRows[0].id)
      }
      setExistingFiles(fileRows)
    })()
  }, [fileWasUploadedCount, setSelectedFileId1, setExistingFiles]);

  const noFileSelected = {
    value: -1,
    name: '-- No file selected --',
  }
  let message = error
  if (message === "" && existingFiles === null) {
    message = "Loading..."
  }
  const messageEl = <p>{message}</p>
  const existingFileOptionsElements = existingFiles === null ?
    null :
    [...existingFiles].map((f) => {
      const fileName = `${f.user_provided_name}-${f.uploaded_at}`
      return <option key={f.id} value={f.id}>{fileName}</option>
    })
  existingFileOptionsElements?.unshift(
    <option key={noFileSelected.value} value={noFileSelected.value}>
      {noFileSelected.name}
    </option>
  )
  const fileSelector1 = existingFileOptionsElements === null ?
    null :
    <select
      value={selectedFileId1 === null ? noFileSelected.value : selectedFileId1}
      name="file-select-1"
      onChange={(e) => {
        const newValue = convertToInteger(e.target.value)
        if (newValue === noFileSelected.value) {
          setSelectedFileId1(null)
          return
        }
        setSelectedFileId1(newValue)
      }}
    >
      {existingFileOptionsElements}
    </select>
  const fileSelector2 = existingFileOptionsElements === null ?
    null :
    <select
      value={selectedFileId2 === null ? noFileSelected.value : selectedFileId2}
      name="file-select-2"
      onChange={(e) => {
        const newValue = convertToInteger(e.target.value)
        if (newValue === noFileSelected.value) {
          setSelectedFileId2(null)
          return
        }
        setSelectedFileId2(newValue)
      }}
    >
      {existingFileOptionsElements}
    </select>

  return (
    <>
      <h1>Files</h1>
      <h2>Upload New File(s)</h2>
      <FileLoader fileWasUploaded={() => {
        setFileWasUploadedCount(fileWasUploadedCount + 1)
      }} />
      <h2>Select File(s) To Analyze</h2>
      <div className="FileSelector">
        {messageEl}
        <div>
          <label>Main File (used everywhere):
            {fileSelector1}
          </label>
        </div>
        <div>
          <label>Comparison File (see diffs vs main file):
            {fileSelector2}
          </label>
        </div>
      </div>
    </>
  )
}