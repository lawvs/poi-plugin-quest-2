/* eslint-disable no-console */
import { writeFile } from 'fs/promises'
import path from 'path'
import { QuestData } from '../build/kcanotifyGamedata'
import { KcwikiQuestData } from '../build/kcQuestsData'

const CATEGORY_OUTPUT_PATH = path.resolve('build', 'questCategory.json')
const QUEST_CODE_MAP_OUTPUT_PATH = path.resolve('build', 'questCodeMap.json')
const PRE_POST_QUEST_OUTPUT_PATH = path.resolve('build', 'prePostQuest.json')

const kcaQuestStartsFilter = (str: string) =>
  Object.entries(QuestData['zh-CN'])
    .filter(([, quest]) => quest.name.startsWith(str))
    .map(([gameId]) => +gameId)

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
        .filter(([, quest]) => 'memo2' in quest && quest.memo2.includes('季常'))
        .map(([gameId]) => +gameId),
    ]),
  ].sort((a, b) => +a - +b)
  // (年任) (年任 / x 月)
  const yearlyQuest = kcwikiDataSelector()
    .filter(([, quest]) => 'memo2' in quest && quest.memo2.includes('年常任务'))
    .map(([gameId]) => +gameId)
  const singleQuest = mergeDataSelector()
    .filter(
      ([gameId]) =>
        ![
          ...dailyQuest,
          ...weeklyQuest,
          ...monthlyQuest,
          ...quarterlyQuest,
          ...yearlyQuest,
        ].includes(+gameId),
    )
    .map(([gameId]) => +gameId)

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
  return data
}

const genQuestMap = async () => {
  const data = Object.entries(KcwikiQuestData['zh-CN']).reduce(
    (acc, [gameId, { code }]) => {
      if (code in acc) {
        console.warn(`Duplicate quest code: ${code}`)
        process.exitCode = 1
      }
      acc[code] = +gameId
      return acc
    },
    {} as Record<string, number>,
  )
  await writeFile(QUEST_CODE_MAP_OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log('Updated quest map', QUEST_CODE_MAP_OUTPUT_PATH)
  return data
}

const genPrePostQuestMap = async (code2IdQuestMap: Record<string, number>) => {
  const compareQuest = (code1: string, code2: string) => {
    if (!code2IdQuestMap[code1] || !code2IdQuestMap[code2]) {
      return 0
    }

    return code2IdQuestMap[code1] - code2IdQuestMap[code2]
  }

  const data = Object.entries(KcwikiQuestData['zh-CN']).reduce(
    (acc, [gameId, { code, pre }]) => {
      if (!pre || pre.length === 0) {
        return acc
      }
      if (!acc[gameId]) {
        acc[gameId] = { pre: [], post: [] }
      }
      pre.forEach((preCode) => {
        acc[gameId].pre.push(preCode)

        const preQuestId = code2IdQuestMap[preCode]
        if (preQuestId) {
          if (!acc[preQuestId]) {
            acc[preQuestId] = { pre: [], post: [] }
          }
          acc[preQuestId].post.push(code)
        }
      })
      return acc
    },
    {} as Record<string, { pre: string[]; post: string[] }>,
  )

  // Sort pre/post quests
  for (const key in data) {
    data[key].pre.sort(compareQuest)
    data[key].post.sort(compareQuest)
  }

  await writeFile(PRE_POST_QUEST_OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log('Updated quest map', PRE_POST_QUEST_OUTPUT_PATH)
  return data
}

const main = async () => {
  await genQuestCategory()
  const code2IdQuestMap = await genQuestMap()
  await genPrePostQuestMap(code2IdQuestMap)
}

main()
