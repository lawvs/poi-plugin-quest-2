/* eslint-disable no-console */
import { writeFile } from 'fs/promises'
import path from 'path'
import { QuestData } from '../build/kcanotifyGamedata'
import { KcwikiQuestData } from '../build/kcQuestsData'

const CATEGORY_OUTPUT_PATH = path.resolve('build', 'questCategory.json')
const QUEST_MAP_OUTPUT_PATH = path.resolve('build', 'questMap.json')

const kcaQuestStartsFilter = (str: string) =>
  Object.entries(QuestData['zh-CN'])
    .filter(([, quest]) => quest.name.startsWith(str))
    .map(([gameId]) => gameId)

const kcwikiDataSelector = () => Object.entries(KcwikiQuestData['zh-CN'])
const mergeDataSelector = () =>
  Object.entries({ ...QuestData['zh-CN'], ...KcwikiQuestData['zh-CN'] })

const genQuestCategory = async () => {
  const dailyQuest = kcaQuestStartsFilter('(日任)')
  const weeklyQuest = kcaQuestStartsFilter('(周任)')
  const monthlyQuest = kcaQuestStartsFilter('(月任)')
  const quarterlyQuest = [
    ...new Set([
      ...kcaQuestStartsFilter('(季任)'),
      ...kcwikiDataSelector()
        .filter(([, quest]) => quest.memo2.includes('季常任务'))
        .map(([gameId]) => gameId),
    ]),
  ].sort((a, b) => +a - +b)
  // (年任) (年任 / x 月)
  const yearlyQuest = kcwikiDataSelector()
    .filter(([, quest]) => quest.memo2.includes('年常任务'))
    .map(([gameId]) => gameId)
  const singleQuest = mergeDataSelector()
    .filter(
      ([gameId]) =>
        ![
          ...dailyQuest,
          ...weeklyQuest,
          ...monthlyQuest,
          ...quarterlyQuest,
          ...yearlyQuest,
        ].includes(gameId)
    )
    .map(([gameId]) => gameId)

  const data = {
    dailyQuest,
    weeklyQuest,
    monthlyQuest,
    quarterlyQuest,
    yearlyQuest,
    singleQuest,
  }

  await writeFile(CATEGORY_OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log('Updated quest category', CATEGORY_OUTPUT_PATH)
}

const genQuestMap = async () => {
  const data = Object.entries(KcwikiQuestData['zh-CN']).reduce(
    (acc, [gameId, { code }]) => {
      if (code in acc) {
        console.warn(`Duplicate quest code: ${code}`)
      }
      if (Number.isNaN(+gameId)) {
        console.warn(`Invalid gameId: ${gameId}`)
      }
      acc[code] = gameId
      return acc
    },
    {} as Record<string, string>
  )
  await writeFile(QUEST_MAP_OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log('Updated quest map', QUEST_MAP_OUTPUT_PATH)
}

const main = async () => {
  await genQuestCategory()
  await genQuestMap()
}

main()
