import "./styles/ChunkRow.css"
import { JsonViewer } from '@textea/json-viewer'
import { ProcessedChunkInfo } from '../helpers/processModulesAndChunks'
import { ImmutableMap, ImmutableObject } from '@hookstate/core'
import { getHumanReadableChunkName } from '../helpers/chunks'


export function ChunkRow(props: {
  chunk: ImmutableObject<ProcessedChunkInfo>
  showRawInfo: boolean,
  setShowRawInfo: (chunkDatabaseId: number) => void
  chunksByDatabaseId: ImmutableMap<number, ProcessedChunkInfo>
}) {
  const { chunk, showRawInfo, setShowRawInfo, chunksByDatabaseId } = props

  const rawInfo = showRawInfo ?
    <JsonViewer value={chunk} />
    : null

  return (
    <div className="chunkRow">
      <div>
        <p>Id: {chunk.rawFromWebpack.id}</p>
        <p>Name(s): {getHumanReadableChunkName(chunk)}</p>
        <p>Size: {Math.round(chunk.rawFromWebpack.size / 1024)} kb</p>
        <p>Generated Asset Name(s): {chunk.rawFromWebpack.files?.join(", ")}</p>
        <button onClick={() => { if (showRawInfo) { setShowRawInfo(-1) } else { setShowRawInfo(chunk.chunkDatabaseId)}}}>Show {showRawInfo ? "Less" : "More"}</button>
      </div>
      {rawInfo}
    </div>
  )
}
