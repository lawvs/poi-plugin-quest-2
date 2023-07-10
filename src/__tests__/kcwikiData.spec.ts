import { version, KcwikiQuestData } from '../../build/kcQuestsData'
import newQuestData from '../../build/kcQuestsData/quests-scn-new.json'

describe('should version correct', () => {
  test('should KcwikiQuestData Game data version correct', () => {
    expect(version).toMatchInlineSnapshot(
      `"0268077fdfb4947e2e72b15479d5b282f1f0955b"`
    )
  })

  test('should KcwikiQuestData Game data keys correct', () => {
    expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
          Array [
            "zh-CN",
          ]
      `)
  })
})

describe('should format correct', () => {
  test('key format', () => {
    Object.keys(KcwikiQuestData['zh-CN']).forEach((key) => {
      // gameId should not extra space
      expect(key.trim()).toEqual(key)
      // gameId should be number
      expect(String(+key)).toEqual(key)
    })
  })

  test('new quest key format', () => {
    Object.keys(newQuestData).forEach((gameId) => {
      // gameId should not extra space
      expect(gameId.trim()).toEqual(gameId)
      // gameId should be number
      expect(String(+gameId)).toEqual(gameId)
    })
  })
})
