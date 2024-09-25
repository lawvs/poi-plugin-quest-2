import { KcwikiQuestData, version } from '../../build/kcQuestsData'
import newQuestData from '../../build/kcQuestsData/quests-scn-new.json'

describe('should version correct', () => {
  test('should KcwikiQuestData Game data version correct', () => {
    expect(version).toMatchInlineSnapshot(
      `"3311e128592585b293ae3b3732f474997c7448d7"`,
    )
  })

  test('should KcwikiQuestData Game data keys correct', () => {
    expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
     [
       "zh-CN",
     ]
    `)
  })
})

describe('should format correct', () => {
  test('key format', () => {
    Object.keys(KcwikiQuestData['zh-CN']).forEach((key) => {
      // gameId should not extra space
      expect(key).toEqual(key.trim())
      // gameId should be number
      expect(key).toEqual(String(+key))
    })
  })

  test('new quest key format', () => {
    Object.keys(newQuestData).forEach((gameId) => {
      // gameId should not extra space
      expect(gameId).toEqual(gameId.trim())
      // gameId should be number
      expect(gameId).toEqual(String(gameId))
    })
  })
})
