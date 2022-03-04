import { version, KcwikiQuestData } from '../../build/kcQuestsData'

describe('should version correct', () => {
  test('should KcwikiQuestData Game data version correct', () => {
    expect(version).toMatchInlineSnapshot(
      `"f4954599e699417bca2f855c1b67c695837eb5c5"`
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
})
