import { writeFileSync } from 'fs'
import path from 'path'
import { QuestData } from '../build/kcanotifyGamedata'
import { KcwikiQuestData } from '../build/kcQuestsData'

const OUTPUT_PATH = path.resolve('build', 'questCategory.json')

const kcaQuestStartsFilter = (str: string) =>
  Object.entries(QuestData['zh-CN'])
    .filter(([, quest]) => quest.name.startsWith(str))
    .map(([gameId]) => gameId)

const kcwikiDataSelector = () => Object.entries(KcwikiQuestData['zh-CN'])
const mergeDataSelector = () =>
  Object.entries({ ...QuestData['zh-CN'], ...KcwikiQuestData['zh-CN'] })

const main = () => {
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

  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2))
}

main()
