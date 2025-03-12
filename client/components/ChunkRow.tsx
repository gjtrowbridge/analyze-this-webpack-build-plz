import { StatsChunk } from 'webpack'
import "./styles/ChunkRow.css"
import { ChunkIdentifier } from '../helpers/chunks'
import { JsonViewer } from '@textea/json-viewer'

type SortBy = "Size"

export function ChunkRow(props: {
  chunk: StatsChunk
  showRawInfo: boolean,
  setShowRawInfo: (chunkId: ChunkIdentifier) => void
}) {
  const { chunk, showRawInfo, setShowRawInfo } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={chunk} />
    : null

  return (
    <div className="chunkRow">
      <div>
        <p>Id: {chunk.id}</p>
        <p>Name(s): {chunk.names?.join(",") ?? "N/A"}</p>
        <p>Size: {Math.round(chunk.size / 1024)} kb</p>
        <p>Generated Asset Name(s): {chunk.files.join(", ")}</p>
        <button onClick={() => { if (showRawInfo) { setShowRawInfo("") } else { setShowRawInfo(chunk.id)}}}>Show {showRawInfo ? "Less" : "More"}</button>
      </div>
      {rawInfo}
    </div>
  )
}
