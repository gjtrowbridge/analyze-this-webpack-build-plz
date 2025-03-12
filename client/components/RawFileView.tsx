import { JsonViewer } from '@textea/json-viewer'
import { useEffect, useState } from 'react'
import axios from 'axios'
import type { StatsModule } from 'webpack'

export function RawFileView(props: { fileName: string }) {
  const { fileName } = props
  const [contents, setContents] = useState<object>({ message: "File is loading..." })

  useEffect(() => {
    if (fileName === null) {
      return
    }
    void (async () => {
      const res = await axios.get<object>(`/api/raw_file/${fileName}`)
      if (res.status > 300) {
        setContents({
          fileName,
          message: "Something went wrong loading the file",
          data: res.data,
          status: res.status,
        })
        return
      }
      setContents(res.data)
    })()
  }, [fileName, setContents]);

  return (
    <div className={"RawFileView"}>
      <h1>{fileName}</h1>
      <JsonViewer value={contents} />
    </div>
  )
}
