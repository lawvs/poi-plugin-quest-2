import { usePluginTranslation } from '../poi/hooks'
import {
  DocQuest,
  getKcanotifyQuestData,
  getQuestIdByCode,
  QUEST_STATUS,
  UnionQuest,
} from '../questHelper'
import { useGlobalGameQuest, useGlobalQuestStatusQuery } from './gameQuest'
import { checkIsKcwikiSupportedLanguages, useKcwikiData } from './kcwiki'

const DEFAULT_LANG = 'ja-JP'

const checkIsKcanotifySupportedLanguages = (
  lang: string,
): lang is keyof typeof kcaQuestData => {
  const kcaQuestData = getKcanotifyQuestData()
  return lang in kcaQuestData
}

export const isSupportedLanguages = (
  lang: string,
): lang is keyof ReturnType<typeof getKcanotifyQuestData> =>
  checkIsKcanotifySupportedLanguages(lang) ||
  checkIsKcwikiSupportedLanguages(lang)

export const useLanguage = () => {
  const {
    i18n: { language },
  } = usePluginTranslation()
  const lang = checkIsKcanotifySupportedLanguages(language)
    ? language
    : DEFAULT_LANG
  return lang
}

const useQuestMap = (): Record<string, DocQuest> => {
  const lang = useLanguage()
  const kcwikiData = useKcwikiData(lang)
  if (kcwikiData) {
    return kcwikiData
  }
  const kcaQuestData = getKcanotifyQuestData()
  return kcaQuestData[lang]
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
