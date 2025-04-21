import { FileLoader } from './FileLoader'
import { convertToInteger } from '../../server/helpers/misc'
import { useHookstate } from '@hookstate/core'
import { filesGlobalState } from '../globalState'
import { useStateRefreshFunctions } from '../hooks/useRefresh'
import Button from '@mui/material/Button'
import { MenuItem, TextField } from '@mui/material'


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
        style={{
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
        style={{
          marginTop: '10px'
        }}
        variant={'outlined'}
        label={"Comparison File"}
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
      <h1>Files</h1>
      <Button variant={"outlined"} onClick={() => {
        void refreshFileData('file1')
        void refreshFileData('file2')
      }}>Refresh File Data</Button>
      <Button variant={"outlined"} onClick={() => {
        clearFileData('file1')
        clearFileData('file2')
      }}>Clear File Data</Button>
      <h2>Upload New File(s)</h2>
      <FileLoader />
      <h2>Select File(s) To Analyze</h2>
      <div className="FileSelector">
        {statusEl}
        {newFileSelector1}
        {newFileSelector2}
      </div>
    </>
  )
}
