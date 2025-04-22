import { FileLoader } from './FileLoader'
import { convertToInteger } from '../../server/helpers/misc'
import { useHookstate } from '@hookstate/core'
import { filesGlobalState } from '../globalState'
import { useStateRefreshFunctions } from '../hooks/useRefresh'
import Button from '@mui/material/Button'
import { MenuItem, TextField, Typography } from '@mui/material'


export function FileSelector() {
  const files = useHookstate(filesGlobalState)
  const {
    refreshFileData,
    clearFileData,
  } = useStateRefreshFunctions()
  const f = files.get()

  let statusEl = null

  let newFileSelector1 = null
  let newFileSelector2 = null
  let menuItems = null

  const noFileSelected = {
    value: -1,
    name: " -- None Selected --"
  }

  if (f.status !== "LOADED") {
    statusEl = <p>Status: {f.status}</p>
  } else {
    const existingFiles = f.existingFiles
    const { selectedFileId1, selectedFileId2 } = f

    menuItems = existingFiles.map((f) => {
      const fileName = `${f.user_provided_name}-${f.uploaded_at}`
      return (
        <MenuItem
          key={f.id}
          value={f.id}
        >
          {fileName}
        </MenuItem>
      )
    })
    menuItems.unshift(
      <MenuItem
        key={noFileSelected.value}
        value={noFileSelected.value}
      >
        {noFileSelected.name}
      </MenuItem>
    )

    newFileSelector1 = (
      <TextField
        sx={{
          marginTop: '10px'
        }}
        label={"Main File (used everywhere)"}
        value={selectedFileId1 === undefined ? noFileSelected.value : selectedFileId1}
        select={true}
        fullWidth={true}
        onChange={(e) => {
          const newValue = convertToInteger(e.target.value)
          if (newValue === noFileSelected.value) {
            files.merge({ selectedFileId1: undefined })
            return
          }
          files.merge({ selectedFileId1: newValue })
        }}
      >
        {menuItems}
      </TextField>
    )
    newFileSelector2 = (
      <TextField
        sx={{
          marginTop: '10px'
        }}
        variant={'outlined'}
        label={"Comparison File (used in comparisons only)"}
        value={selectedFileId2 === undefined ? noFileSelected.value : selectedFileId2}
        select={true}
        fullWidth={true}
        onChange={(e) => {
          const newValue = convertToInteger(e.target.value)
          if (newValue === noFileSelected.value) {
            files.merge({ selectedFileId2: undefined })
            return
          }
          files.merge({ selectedFileId2: newValue })
        }}
      >
        {menuItems}
      </TextField>
    )
  }

  return (
    <>
      <Typography variant={'h3'}>Files</Typography>
      <Button variant={"outlined"} onClick={() => {
        void refreshFileData('file1')
        void refreshFileData('file2')
      }}>Refresh File Data</Button>
      <Button variant={"outlined"} onClick={() => {
        clearFileData('file1')
        clearFileData('file2')
      }}>Clear File Data</Button>
      <Typography variant={'h4'}>Select File(s) To Analyze</Typography>
      <div className="FileSelector">
        {statusEl}
        {newFileSelector1}
        {newFileSelector2}
      </div>
      <Typography variant={'h4'}>Upload New File(s)</Typography>
      <FileLoader />
    </>
  )
}
