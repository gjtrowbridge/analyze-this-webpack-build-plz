import {ChangeEvent, ChangeEventHandler, useCallback, useState, ReactElement} from "react"
import axios from 'axios'
import { alternateFileNameRegex } from '../../shared/helpers'
import { useRefreshFilesFn } from '../hooks/useFiles'
import { Input, TextField, Typography, Snackbar, CircularProgress } from '@mui/material'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'

export function FileLoader() {
  const refreshFilesFn = useRefreshFilesFn()
  const [file, setFile] = useState<File | null>(null)
  const [alternateName, setAlternateName] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
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
    setIsUploading(true)
    try {
      const res1 = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      if (res1.status > 300) {
        console.error("Something went wrong while uploading the file")
      } else {
        refreshFilesFn()
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }, [file, refreshFilesFn, alternateName])

  return (
    <>
      <Button
        component={'label'}
        role={undefined}
        variant={'outlined'}
      >
        Select A stats.json File To Upload
        <Input
          type={'file'}
          onChange={onChangeFile}
        />
      </Button>
      <div>
        <TextField
          sx={{
            marginTop: '10px'
          }}
          id="outlined-basic"
          label="(Required) Enter custom file prefix"
          variant="outlined"
          value={alternateName}
          onChange={onChangeText}
          fullWidth={true}
        />
      </div>
      <Button
        sx={{ marginTop: '10px' }}
        variant={'contained'}
        onClick={onClickButton}
        disabled={file === null || alternateName === ''}
      >Upload</Button>

      <Snackbar
        open={isUploading}
        message="Uploading file..."
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        action={
          <CircularProgress size={20} color="inherit" />
        }
      />
    </>
  )
}
