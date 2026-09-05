import type {
  QuestAnalysis,
  QuestAnalysisDebug,
  QuestAnalysisSummary,
} from './analysis'
import type { ImportedCsvMeta } from './importedInventory/types'
import type { UnionQuest } from './questHelper'

export interface QuestExportRecord {
  gameId: number
  code: string
  name: string
  description: string
  rewards?: string
  details?: string
  inGameState: number | null
  analysis: {
    status: QuestAnalysis['status']
    origin: QuestAnalysis['origin']
    missingShips: string[]
    missingEquipments: string[]
    missingInventoryParts: Array<'ships' | 'equipments'>
    notes: string[]
  }
  debug?: QuestAnalysisDebug
}

export interface QuestExportPayload {
  generatedAt: string
  pluginVersion: string
  inventory: {
    shipCsv: ImportedCsvMeta | null
    equipmentCsv: ImportedCsvMeta | null
  }
  quests: QuestExportRecord[]
  analysisSummary: QuestAnalysisSummary
}

export const buildQuestExportPayload = ({
  quests,
  analysisMap,
  debugMap,
  summary,
  inventory,
  pluginVersion,
}: {
  quests: UnionQuest[]
  analysisMap: Record<number, QuestAnalysis>
  debugMap?: Record<number, QuestAnalysisDebug>
  summary: QuestAnalysisSummary
  inventory: {
    shipCsv: ImportedCsvMeta | null
    equipmentCsv: ImportedCsvMeta | null
  }
  pluginVersion: string
}): QuestExportPayload => ({
  generatedAt: new Date().toISOString(),
  pluginVersion,
  inventory,
  quests: quests.map((quest) => ({
    gameId: quest.gameId,
    code: quest.docQuest.code,
    name: quest.docQuest.name,
    description: quest.docQuest.desc,
    rewards: quest.docQuest.rewards,
    details: quest.docQuest.memo2,
    inGameState: quest.gameQuest?.api_state ?? null,
    analysis: {
      status: analysisMap[quest.gameId]?.status ?? 'unsupported',
      origin: analysisMap[quest.gameId]?.origin ?? 'none',
      missingShips: analysisMap[quest.gameId]?.missingShips ?? [],
      missingEquipments: analysisMap[quest.gameId]?.missingEquipments ?? [],
      missingInventoryParts:
        analysisMap[quest.gameId]?.missingInventoryParts ?? [],
      notes: analysisMap[quest.gameId]?.notes ?? [],
    },
    debug: debugMap?.[quest.gameId],
  })),
  analysisSummary: summary,
})
