import { QUEST_DATA } from '../../build'
import { usePluginTranslation } from '../poi/hooks'
import {
  DocQuest,
  getQuestIdByCode,
  QUEST_STATUS,
  UnionQuest,
} from '../questHelper'
import { useGlobalGameQuest, useGlobalQuestStatusQuery } from './gameQuest'
import { DataSource, useStore } from './store'

const useLanguage = () => {
  const {
    i18n: { language },
  } = usePluginTranslation()
  return language
}

export const useDataSource = () => {
  const {
    store: { dataSource },
    updateStore,
  } = useStore()
  const lang = useLanguage()
  const setDataSource = (val: DataSource | null) =>
    updateStore({ dataSource: val })
  const isValid =
    dataSource && Object.values(QUEST_DATA).find((i) => i.key === dataSource)
  const normalizedDataSource = isValid
    ? dataSource
    : (QUEST_DATA.find((i) => i.lang === lang)?.key ?? QUEST_DATA[0].key)
  return { dataSource: normalizedDataSource, setDataSource }
}

const useQuestMap = (): Record<string, DocQuest> => {
  const { dataSource } = useDataSource()
  if (!QUEST_DATA.length) {
    throw new Error('QUEST_DATA is empty')
  }
  const data = QUEST_DATA.find((i) => i.key === dataSource)
  if (!data) {
    return QUEST_DATA[0].res
  }
  return data.res
}

export const useQuest = (): UnionQuest[] => {
  const docQuestMap = useQuestMap()
  const gameQuest = useGlobalGameQuest()
  // TODO extract new quest from game quest
  // Not yet recorded quest
  // May be a new quest
  // if (!(gameId in docQuestMap)) {
  //   return {
  //     gameId,
  //     gameQuest: quest,
  //     docQuest: {
  //       code: `${getCategory(quest.api_category).wikiSymbol}?`,
  //       name: quest.api_title,
  //       desc: quest.api_detail,
  //     },
  //   }
  // }
  // Return all recorded quests
  return Object.entries(docQuestMap).map(([gameId, val]) => ({
    gameId: +gameId,
    // Maybe empty
    gameQuest: gameQuest.find((quest) => quest.api_no === Number(gameId)),
    docQuest: val,
  }))
}

export const useQuestByCode = (code: string) => {
  const questMap = useQuestMap()
  const gameId = getQuestIdByCode(code)
  if (gameId && gameId in questMap) {
    return {
      gameId,
      docQuest: questMap[String(gameId) as keyof typeof questMap],
    }
  }
  return null
}

/**
 * Get the completion status of a specific game quest
 */
export const useQuestStatus = (gameId: number | null) => {
  const searcher = useGlobalQuestStatusQuery()
  if (!gameId) {
    return QUEST_STATUS.UNKNOWN
  }
  return searcher(gameId)
}
