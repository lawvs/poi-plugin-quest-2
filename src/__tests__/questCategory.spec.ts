import questCategory from '../../build/questCategory.json'
import { KcwikiQuestData } from '../../build/kcQuestsData'
import { QuestData as KcaQuestData } from '../../build/kcanotifyGamedata'

describe('should questCategory correct', () => {
  test('length', () => {
    expect(questCategory.dailyQuest.length).toMatchInlineSnapshot(`23`)
    expect(questCategory.weeklyQuest.length).toMatchInlineSnapshot(`19`)
    expect(questCategory.monthlyQuest.length).toMatchInlineSnapshot(`14`)
    expect(questCategory.quarterlyQuest.length).toMatchInlineSnapshot(`28`)
    expect(questCategory.yearlyQuest.length).toMatchInlineSnapshot(`53`)
    expect(questCategory.singleQuest.length).toMatchInlineSnapshot(`474`)
  })

  test('snapshot', () => {
    const mergeData = {
      ...KcaQuestData['zh-CN'],
      ...KcwikiQuestData['zh-CN'],
    }
    const humanReadableData = Object.fromEntries(
      Object.entries(questCategory).map(([key, val]) => [
        key,
        val
          .sort((a, b) => a - b)
          .map((gameId) => ({
            gameId,
            code: mergeData[String(gameId) as keyof typeof mergeData].code,
            name: mergeData[String(gameId) as keyof typeof mergeData].name,
          })),
      ]),
    )

    expect(humanReadableData).toMatchSnapshot({
      singleQuest: expect.any(Array),
    })
  })
})
