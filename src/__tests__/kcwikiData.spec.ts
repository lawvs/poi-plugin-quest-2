import { version, KcwikiQuestData } from '../../build/kcQuestsData'

describe('should version correct', () => {
  test('should KcwikiQuestData Game data version correct', () => {
    expect(version).toMatchInlineSnapshot(
      `"9c5a15512d59eaad02e09fe717defba581c4e4a3"`
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
