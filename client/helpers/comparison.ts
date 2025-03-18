import { ModuleIdentifier } from './modules'
import { ChunkIdentifier } from './chunks'
import { type StatsChunk, StatsModule } from 'webpack'
import { ChunksById, ModulesById } from '../types'

export interface ComparisonData {
  modules: {
    onlyInFile1: Array<ModuleIdentifier>
    onlyInFile2: Array<ModuleIdentifier>
    changed: Array<ModuleIdentifier>
  },
  chunks: {
    onlyInFile1: Array<ChunkIdentifier>
    onlyInFile2: Array<ChunkIdentifier>
    changed: Array<ChunkIdentifier>
  }
}

function hasChanged<T extends StatsModule | StatsChunk>(args: {
  before: T,
  after: T,
}) {
  const { before, after } = args
  return before.size !== after.size
}

function getModulesById(modules: Array<StatsModule>): ModulesById {
  const modulesById = new Map<ModuleIdentifier, StatsModule>()
  modules.forEach((m) => {
    modulesById.set(m.identifier, m)
  })
  return modulesById
}
function getChunksById(chunks: Array<StatsChunk>): ChunksById {
  const chunksById = new Map<ChunkIdentifier, StatsChunk>()
  chunks.forEach((c) => {
    chunksById.set(c.id, c)
  })
  return chunksById
}

export function getComparisonData(args: {
  modules: {
    file1: Array<StatsModule>,
    file2: Array<StatsModule>,
  },
  chunks: {
    file1: Array<StatsChunk>,
    file2: Array<StatsChunk>,
  }
}): {
  data: ComparisonData
  modulesById1: ModulesById,
  modulesById2: ModulesById,
  chunksById1: ChunksById,
  chunksById2: ChunksById,
} {
  const { modules, chunks } = args
  const modulesById1 = getModulesById(modules.file1)
  const modulesById2 = getModulesById(modules.file2)
  const chunksById1 = getChunksById(chunks.file1)
  const chunksById2 = getChunksById(chunks.file2)

  const comparisonData: ComparisonData = {
    modules: {
      onlyInFile1: [],
      onlyInFile2: [],
      changed: [],
    },
    chunks: {
      onlyInFile1: [],
      onlyInFile2: [],
      changed: [],
    },
  }
  modules.file1.forEach((m1) => {
    const m2 = modulesById2.get(m1.identifier)
    if (m2 === undefined) {
      comparisonData.modules.onlyInFile1.push(m1.identifier)
      return
    }
    if (hasChanged({ before: m1, after: m2 })) {
      comparisonData.modules.changed.push(m1.identifier)
    }
  })
  modules.file2.forEach((m2) => {
    const m1Exists = modulesById1.has(m2.identifier)
    if (!m1Exists) {
      comparisonData.modules.onlyInFile2.push(m2.identifier)
    }
  })

  chunks.file1.forEach((c1) => {
    const c2 = chunksById2.get(c1.id)
    if (c2 === undefined) {
      comparisonData.chunks.onlyInFile1.push(c1.id)
      return
    }
    if (hasChanged({ before: c1, after: c2 })) {
      comparisonData.chunks.changed.push(c1.id)
    }
  })
  chunks.file2.forEach((c2) => {
    const c1Exists = chunksById1.has(c2.id)
    if (!c1Exists) {
      comparisonData.chunks.onlyInFile2.push(c2.id)
    }
  })

  return {
    data: comparisonData,
    chunksById1,
    chunksById2,
    modulesById1,
    modulesById2,
  }
}