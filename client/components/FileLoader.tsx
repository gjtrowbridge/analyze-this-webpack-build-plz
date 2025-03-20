import {ChangeEvent, ChangeEventHandler, useCallback, useState, ReactElement} from "react"
import axios from 'axios'
import { alternateFileNameRegex } from '../../shared/helpers'

export function FileLoader(props: {
  fileWasUploaded: () => void
}) {
  const { fileWasUploaded } = props
  const [file, setFile] = useState<File | null>(null)
  const [alternateName, setAlternateName] = useState<string>("")
  const [loadingState, setLoadingState] = useState<string>("")
  const onChangeFile: ChangeEventHandler<HTMLInputElement> = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const inputElement = event.target
    const f = inputElement.files && inputElement.files[0]
    if (f) {
      setFile(f)
    }
  }, [setFile])
  const onChangeText: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const proposedName = e.target.value
    if (proposedName === "" || alternateFileNameRegex.test(proposedName)) {
      setAlternateName(proposedName)
    } else {
      console.warn("Sorry, only alphanumeric characters, dashes, and underscores allowed")
    }
  }, [setAlternateName])
  const onClickButton = useCallback(async () => {
    const formData = new FormData()
    formData.append('alternateName', alternateName)
    formData.append('file', file)
    const s = file.stream()
    setLoadingState("uploading file...")
    const res1 = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    if (res1.status > 300) {
      setLoadingState("Something went wrong while uploading the file")
    } else {
      setLoadingState("Done uploading file")
      fileWasUploaded()
    }
  }, [file, fileWasUploaded, setLoadingState])

  let uploadButton: ReactElement = null
  if (file) {
    uploadButton = <button onClick={onClickButton}>Upload</button>
  }

  return (
    <>
      <p>{loadingState}</p>
      <div>
        <label>
          Select a file:
          <input type="file" onChange={onChangeFile} accept={".json"} />
        </label>
      </div>
      <div>
        <label>
          (Optional) Enter a custom file name prefix (alphanumeric, dash, underscore only)
          <input type="text" onChange={onChangeText} value={alternateName} />
        </label>
      </div>
      {uploadButton}
    </>
  )
}
