import { FileLoader } from './FileLoader'
import { convertToInteger } from '../../server/helpers/misc'
import { useHookstate } from '@hookstate/core'
import { filesGlobalState } from '../globalState'
import { useState } from 'react'
import { useStateRefreshFunctions } from '../hooks/useRefresh'


export function FileSelector() {
  const files = useHookstate(filesGlobalState)
  const {
    refreshFileData,
    clearFileData,
    rawState1,
    rawState2,
  } = useStateRefreshFunctions()
  const f = files.get()

  console.log('xcxc raw state 1', rawState1.isReady, rawState1.modulesByDatabaseId.size)
  console.log('xcxc raw state 2', rawState2.isReady, rawState2.modulesByDatabaseId.size)

  let statusEl = null
  let existingFileOptionsElements = null
  let fileSelector1 = null
  let fileSelector2 = null

  const noFileSelected = {
    value: -1,
    name: " -- None Selected --"
  }

  if (f.status !== "LOADED") {
    statusEl = <p>Status: {f.status}</p>
  } else {
    const existingFiles = f.existingFiles
    const { selectedFileId1, selectedFileId2 } = f
    existingFileOptionsElements = [...existingFiles].map((f) => {
      const fileName = `${f.user_provided_name}-${f.uploaded_at}`
      return <option key={f.id} value={f.id}>{fileName}</option>
    })
    existingFileOptionsElements.unshift(
      <option
        key={noFileSelected.value}
        value={noFileSelected.value}
      >
        {noFileSelected.name}
      </option>
    )
    fileSelector1 = <select
        value={selectedFileId1 === undefined ? noFileSelected.value : selectedFileId1}
        name="file-select-1"
        onChange={(e) => {
          const newValue = convertToInteger(e.target.value)
          if (newValue === noFileSelected.value) {
            files.merge({ selectedFileId1: undefined })
            return
          }
          files.merge({ selectedFileId1: newValue })
        }}
      >
        {existingFileOptionsElements}
      </select>
    fileSelector2 = <select
      value={selectedFileId2 === undefined ? noFileSelected.value : selectedFileId2}
      name="file-select-2"
      onChange={(e) => {
        const newValue = convertToInteger(e.target.value)
        if (newValue === noFileSelected.value) {
          files.merge({ selectedFileId2: undefined })
          return
        }
        files.merge({ selectedFileId2: newValue })
      }}
    >
      {existingFileOptionsElements}
    </select>
  }

  return (
    <>
      <h1>Files</h1>
      {/*<button onClick={() => {*/}
      {/*  resetFile1State()*/}
      {/*  resetFile2State()*/}
      {/*}}>Reset State</button>*/}
      <button onClick={() => {
        void refreshFileData('file1')
        void refreshFileData('file2')
      }}>Refresh File Data</button>
      <button onClick={() => {
        clearFileData('file1')
        clearFileData('file2')
      }}>Clear File Data</button>
      <h2>Upload New File(s)</h2>
      <FileLoader />
      <h2>Select File(s) To Analyze</h2>
      <div className="FileSelector">
        {statusEl}
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
