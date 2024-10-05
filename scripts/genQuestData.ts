/* eslint-disable no-console */
import { writeFile } from 'fs/promises'
import path from 'path'
import { kcwikiGameData } from '../build/kcQuestsData'
import { kcanotifyGameData } from '../build/kcanotifyGamedata'
import { parseQuestCode } from './utils'

const EXPORT_QUEST_PATH = path.resolve('build', 'index.ts')
const CATEGORY_OUTPUT_PATH = path.resolve('build', 'questCategory.json')
const QUEST_CODE_MAP_OUTPUT_PATH = path.resolve('build', 'questCodeMap.json')
const PRE_POST_QUEST_OUTPUT_PATH = path.resolve('build', 'prePostQuest.json')

const kcwikiQuestCodeFilter = (
  predicate: (parsedCode: { type: string; number: number }) => boolean,
) =>
  Object.entries(kcwikiGameData.res)
    .filter(([, quest]) => predicate(parseQuestCode(quest.code)))
    .map(([gameId]) => +gameId)

const mergeDataSelector = () =>
  Object.entries({ ...kcanotifyGameData[0].res, ...kcwikiGameData.res })

const genExportQuestData = async () => {
  const code = `import { kcanotifyGameData } from './kcanotifyGamedata'
import { kcwikiGameData } from './kcQuestsData'

export const QUEST_DATA = [kcwikiGameData, ...kcanotifyGameData]
`
  await writeFile(EXPORT_QUEST_PATH, code)
  console.log('Export quest data', QUEST_CODE_MAP_OUTPUT_PATH)
}

const genQuestCategory = async () => {
  const dailyQuest = kcwikiQuestCodeFilter((code) => code.type.endsWith('d'))
  const weeklyQuest = kcwikiQuestCodeFilter((code) => code.type.endsWith('w'))
  const monthlyQuest = kcwikiQuestCodeFilter((code) => code.type.endsWith('m'))
  const quarterlyQuest = kcwikiQuestCodeFilter((code) =>
    code.type.endsWith('q'),
  )
  const yearlyQuest = kcwikiQuestCodeFilter((code) => code.type.endsWith('y'))
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
  const data = Object.entries(kcwikiGameData.res).reduce(
    (acc, [gameId, { code }]) => {
      if (code in acc) {
        console.warn(`Duplicate quest code: ${code}`, acc[code], gameId)
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

  const data = Object.entries(kcwikiGameData.res).reduce(
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
  await genExportQuestData()
  await genQuestCategory()
  const code2IdQuestMap = await genQuestMap()
  await genPrePostQuestMap(code2IdQuestMap)
}

main()
