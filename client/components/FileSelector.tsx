import { useEffect, useState } from 'react'
import axios from 'axios'
import { FileLoader } from './FileLoader'


export function FileSelector(props: {
  selectedFile1: string | null,
  selectedFile2: string | null,
  setSelectedFile1: (f: string | null) => void
  setSelectedFile2: (f: string | null) => void
}) {
  const {
    selectedFile1,
    selectedFile2,
    setSelectedFile1,
    setSelectedFile2,
  } = props
  const [existingFiles, setExistingFiles] = useState<Array<string> | null>(null)
  const [error, setError] = useState<string>("")
  const [fileWasUploadedCount, setFileWasUploadedCount] = useState<number>(0)

  // Get the existing files
  useEffect(() => {
    void (async () => {
      const res = await axios.get<{ files: Array<string>}>(`/api/files`)
      if (res.status > 300) {
        setError("ERROR: Something went wrong fetching the list of files")
      }
      if (selectedFile1 === null) {
        setSelectedFile1(res.data.files[0])
      }
      setExistingFiles(res.data.files)
    })()
  }, [fileWasUploadedCount, setSelectedFile1, setExistingFiles]);

  const noFileSelected = '-- No file selected --'
  let message = error
  if (message === "" && existingFiles === null) {
    message = "Loading..."
  }
  const messageEl = <p>{message}</p>
  const existingFileOptionsElements = existingFiles === null ?
    null :
    [noFileSelected, ...existingFiles].map((f) => {
      return <option key={f} value={f}>{f}</option>
    })
  const fileSelector1 = existingFileOptionsElements === null ?
    null :
    <select
      value={selectedFile1}
      name="file-select-1"
      onChange={(e) => {
        const newFile = e.target.value
        if (newFile !== noFileSelected) {
          setSelectedFile1(newFile)
        }
      }}
    >
      {existingFileOptionsElements}
    </select>
  const fileSelector2 = existingFileOptionsElements === null ?
    null :
    <select
      value={selectedFile2 ?? ""}
      name="file-select-2"
      onChange={(e) => {
        const newFile = e.target.value
        if (newFile === noFileSelected) {
          setSelectedFile2(null)
        } else {
          setSelectedFile2(newFile)
        }
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