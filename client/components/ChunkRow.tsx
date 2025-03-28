import "./styles/ChunkRow.css"
import { JsonViewer } from '@textea/json-viewer'
import { ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { ImmutableObject } from '@hookstate/core'

type SortBy = "Size"

export function ChunkRow(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  showRawInfo: boolean,
  setShowRawInfo: (chunkDatabaseId: number) => void
}) {
  const { chunk, showRawInfo, setShowRawInfo } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={chunk} />
    : null

  return (
    <div className="chunkRow">
      <div>
        <p>Id: {chunk.rawFromWebpack.id}</p>
        <p>Name(s): {chunk.rawFromWebpack.names?.join(",") ?? "N/A"}</p>
        <p>Size: {Math.round(chunk.rawFromWebpack.size / 1024)} kb</p>
        <p>Generated Asset Name(s): {chunk.rawFromWebpack.files?.join(", ")}</p>
        <button onClick={() => { if (showRawInfo) { setShowRawInfo(-1) } else { setShowRawInfo(chunk.chunkDatabaseId)}}}>Show {showRawInfo ? "Less" : "More"}</button>
      </div>
      {rawInfo}
    </div>
  )
}
