import { FileLoader } from './FileLoader'
import { convertToInteger } from '../../server/helpers/misc'
import { useHookstate } from '@hookstate/core'
import { filesGlobalState } from '../globalState'
import { useStateRefreshFunctions } from '../hooks/useRefresh'
import Button from '@mui/material/Button'
import { MenuItem, TextField, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import axios from 'axios'
import { useRefreshFilesFn } from '../hooks/useFiles'

export function FileSelector() {
  const files = useHookstate(filesGlobalState)
  const {
    refreshFileData,
    clearFileData,
  } = useStateRefreshFunctions()
  const f = files.get()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<number | null>(null)
  const refreshFiles = useRefreshFilesFn()

  const handleDeleteClick = (fileId: number) => {
    setFileToDelete(fileId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (fileToDelete !== null) {
      try {
        await axios.delete(`/api/files/${fileToDelete}`)
        refreshFiles()
      } catch (error) {
        console.error('Failed to delete file:', error)
      }
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setFileToDelete(null)
  }

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
      <Typography variant="h4" sx={{ mb: 3 }}>Files</Typography>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <Button variant="outlined" onClick={() => {
          void refreshFileData('file1')
          void refreshFileData('file2')
        }}>Refresh File Data</Button>
        <Button variant="outlined" onClick={() => {
          clearFileData('file1')
          clearFileData('file2')
        }}>Clear File Data</Button>
      </div>

      <Typography variant="h5" sx={{ mb: 2 }}>Select File(s) To Analyze</Typography>
      <div className="FileSelector" style={{ marginBottom: '32px' }}>
        {statusEl}
        {newFileSelector1}
        {newFileSelector2}
      </div>

      <Typography variant="h5" sx={{ mb: 2 }}>Upload New File(s)</Typography>
      <div style={{ marginBottom: '32px' }}>
        <FileLoader />
      </div>

      {f.status === "LOADED" && f.existingFiles.length > 0 && (
        <>
          <Accordion 
            sx={{ mt: 2 }}
            onChange={(_, expanded) => {
              if (expanded) {
                setTimeout(() => {
                  const element = document.querySelector('.MuiAccordion-root');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
              }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">Remove Files</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {f.existingFiles.map((file) => (
                  <ListItem 
                    key={file.id}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      mb: 1,
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <ListItemText
                      primary={file.user_provided_name}
                      secondary={file.uploaded_at}
                      primaryTypographyProps={{
                        fontWeight: 'medium',
                        fontSize: '1.1rem'
                      }}
                    />
                    <Button 
                      variant="contained" 
                      color="error"
                      size="small"
                      onClick={() => handleDeleteClick(file.id)}
                    >
                      Delete
                    </Button>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              Are you sure you want to delete "{f.existingFiles.find(file => file.id === fileToDelete)?.user_provided_name}"? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  )
}
